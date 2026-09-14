import { NextResponse } from "next/server";
import africastalking from "africastalking";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { normalizeKenyanPhoneNumber, requireUuid } from "@/lib/validation";

const GUARD_SAFE_VISITOR_SELECT = [
  "id",
  "company_id",
  "gate_id",
  "name",
  "phone_last4",
  "document_type",
  "id_number_last4",
  "vehicle_reg_last4",
  "status",
  "created_at",
  "checked_in_at",
  "expected_arrival",
  "is_pre_registered",
  "pre_registered_by",
  "host_id",
  "host_name",
  "host_confirmed",
  "host_confirmed_at",
  "purpose",
  "photo_url",
  "custom_data",
  "otp_code",
  "pass_token",
  "pass_code",
  "pass_expired_at",
  "verification_method",
].join(", ");

async function sendHostArrivalSms({
  hostPhone,
  visitorName,
  gateName,
}: {
  hostPhone?: string | null;
  visitorName: string;
  gateName?: string | null;
}) {
  if (!hostPhone) return;

  const username = process.env.AFRICASTALKING_USERNAME?.trim();
  const apiKey = process.env.AFRICASTALKING_API_KEY?.trim();

  if (!username || !apiKey) {
    console.warn("Africa's Talking credentials not configured, skipping arrival SMS.");
    return;
  }

  try {
    const rawNormalized = normalizeKenyanPhoneNumber(hostPhone);
    const destinationNumber = rawNormalized.startsWith("+") ? rawNormalized : `+${rawNormalized}`;
    const location = gateName ? ` at ${gateName}` : "";
    const message = `Arrival Alert: Your pre-registered visitor ${visitorName} has arrived and checked in${location}. - Karibu VMS`;

    const client = africastalking({ username, apiKey });
    await client.SMS.send({
      to: [destinationNumber],
      message,
      from: "Luffi Access",
    });
  } catch (error) {
    console.error("Failed to send arrival SMS to host via Africa's Talking:", error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRole(request, ["guard", "company_admin", "superadmin"]);
    const body = await request.json();
    const { visitorId, gateId, guardId } = body;

    const safeVisitorId = requireUuid(visitorId, "visitorId");
    const safeGateId = gateId ? requireUuid(gateId, "gateId") : null;
    const safeGuardId = guardId ? String(guardId).trim() : auth.profile.id;

    // 1. Fetch visitor and verify status
    const { data: visitor, error: fetchError } = await auth.supabaseAdmin
      .from("visitors")
      .select("id, company_id, name, status, host_id, host_name, gate_id, expected_arrival")
      .eq("id", safeVisitorId)
      .single();

    if (fetchError || !visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    assertCompanyAccess(auth.profile, visitor.company_id);

    if (visitor.status !== "pre_registered") {
      return NextResponse.json(
        { error: `Visitor is currently '${visitor.status}'. Only pre-registered visitors can be confirmed.` },
        { status: 409 }
      );
    }

    const nowIso = new Date().toISOString();
    let updatedVisitor: unknown = null;

    // 2. Update record to checked_in with timestamps
    const { data: fullUpdate, error: fullError } = await auth.supabaseAdmin
      .from("visitors")
      .update({
        status: "checked_in",
        checked_in_at: nowIso,
        check_in_time: nowIso,
        gate_id: safeGateId || visitor.gate_id,
        guard_id: safeGuardId,
      })
      .eq("id", safeVisitorId)
      .eq("company_id", visitor.company_id)
      .select(GUARD_SAFE_VISITOR_SELECT)
      .single();

    if (fullError) {
      // Fallback if check_in_time or guard_id columns are not yet in database
      const { data: fallbackUpdate, error: fallbackError } = await auth.supabaseAdmin
        .from("visitors")
        .update({
          status: "checked_in",
          checked_in_at: nowIso,
          gate_id: safeGateId || visitor.gate_id,
        })
        .eq("id", safeVisitorId)
        .eq("company_id", visitor.company_id)
        .select(GUARD_SAFE_VISITOR_SELECT)
        .single();

      if (fallbackError) throw fallbackError;
      updatedVisitor = fallbackUpdate;
    } else {
      updatedVisitor = fullUpdate;
    }

    // 3. Resolve host details and gate name for SMS
    let hostPhone: string | null = null;
    let gateName: string | null = null;

    const hostPromise = visitor.host_id
      ? auth.supabaseAdmin
          .from("hosts")
          .select("id, name, phone")
          .eq("id", visitor.host_id)
          .eq("company_id", visitor.company_id)
          .maybeSingle()
      : Promise.resolve({ data: null });

    const gatePromise = safeGateId || visitor.gate_id
      ? auth.supabaseAdmin
          .from("gates")
          .select("id, name")
          .eq("id", safeGateId || visitor.gate_id)
          .eq("company_id", visitor.company_id)
          .maybeSingle()
      : Promise.resolve({ data: null });

    const [hostResult, gateResult] = await Promise.all([hostPromise, gatePromise]);

    if (hostResult.data?.phone) {
      hostPhone = hostResult.data.phone;
    }
    if (gateResult.data?.name) {
      gateName = gateResult.data.name;
    }

    // 4. Dispatch SMS arrival notification to host via Africa's Talking (Sender ID: Luffi Access)
    if (hostPhone) {
      await sendHostArrivalSms({
        hostPhone,
        visitorName: visitor.name,
        gateName,
      });
    }

    return NextResponse.json({
      data: updatedVisitor,
      message: `${visitor.name} checked in successfully.`,
      checkedInAt: nowIso,
    });
  } catch (error) {
    console.error("Confirm pre-registered visitor error:", error);
    const safeError = getSafeErrorResponse(error, "Failed to confirm visitor entry.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

