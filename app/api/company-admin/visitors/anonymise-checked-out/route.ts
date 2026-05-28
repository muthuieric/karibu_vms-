import { NextResponse } from "next/server";
import { getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { writeAuditLog } from "@/lib/audit-log";

async function getEligibleCount(
  supabaseAdmin: Awaited<ReturnType<typeof requireRole>>["supabaseAdmin"],
  companyId: string
) {
  const { count, error } = await supabaseAdmin
    .from("visitors")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("status", "checked_out")
    .is("personal_data_anonymized_at", null);

  if (error) throw error;
  return count || 0;
}

export async function GET(request: Request) {
  try {
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    if (!profile.company_id) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }

    const eligibleCount = await getEligibleCount(supabaseAdmin, profile.company_id);
    return NextResponse.json({ eligibleCount });
  } catch (error) {
    console.error("Checked-out visitor anonymisation count failed:", error);
    const safeError = getSafeErrorResponse(error, "Checked-out visitors could not be counted.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}

export async function POST(request: Request) {
  try {
    const { profile, supabaseAdmin } = await requireRole(request, ["company_admin", "superadmin"]);
    if (!profile.company_id) {
      return NextResponse.json({ error: "Company context is required." }, { status: 400 });
    }

    const body = (await request.json().catch(() => null)) as { confirmation?: unknown } | null;
    if (body?.confirmation !== "ANONYMISE") {
      return NextResponse.json({ error: 'Type "ANONYMISE" to confirm this action.' }, { status: 400 });
    }

    const eligibleCount = await getEligibleCount(supabaseAdmin, profile.company_id);
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("visitors")
      .update({
        name: "Anonymised Visitor",
        phone: null,
        id_number: null,
        vehicle_reg: null,
        phone_encrypted: null,
        phone_hash: null,
        phone_last4: null,
        id_number_encrypted: null,
        id_number_hash: null,
        id_number_last4: null,
        vehicle_reg_encrypted: null,
        vehicle_reg_hash: null,
        vehicle_reg_last4: null,
        photo_url: null,
        custom_data: {},
        personal_data_anonymized_at: nowIso,
      })
      .eq("company_id", profile.company_id)
      .eq("status", "checked_out")
      .is("personal_data_anonymized_at", null)
      .select("id");

    if (error) throw error;

    const anonymisedCount = data?.length || 0;

    await writeAuditLog({
      supabaseAdmin,
      companyId: profile.company_id,
      actor: profile,
      action: "admin_anonymised_checked_out_visitors",
      resourceType: "visitor_collection",
      metadata: {
        anonymisedCount,
        status: "checked_out",
        billingUntouched: true,
      },
    });

    return NextResponse.json({ success: true, anonymisedCount, eligibleCount });
  } catch (error) {
    console.error("Checked-out visitor anonymisation failed:", error);
    const safeError = getSafeErrorResponse(error, "Checked-out visitors could not be anonymised.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
