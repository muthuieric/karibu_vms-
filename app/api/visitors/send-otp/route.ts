import africastalking from "africastalking";
import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { decryptValue } from "@/lib/crypto-fields";
import { checkRateLimit } from "@/lib/rate-limit";
import { requireKenyanPhoneNumber, requireUuid } from "@/lib/validation";

type SmsRecipient = {
  status?: string;
  statusCode?: number | string;
};

type AfricaTalkingSmsResponse = {
  SMSMessageData?: {
    Recipients?: SmsRecipient[];
  };
};

function recipientLooksRejected(recipient: SmsRecipient) {
  const status = String(recipient.status || "").toLowerCase();
  const statusCode = Number(recipient.statusCode);
  return (
    (Number.isFinite(statusCode) && statusCode >= 400) ||
    /failed|invalid|rejected|error|insufficient|not sent/.test(status)
  );
}

function createOtpCode() {
  return String(1000 + crypto.getRandomValues(new Uint32Array(1))[0] % 9000);
}

export async function POST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, { keyPrefix: "visitor-send-otp", limit: 10, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { visitorId } = await request.json();
    const safeVisitorId = requireUuid(visitorId, "visitorId");
    const auth = await requireRole(request, ["guard", "company_admin", "superadmin"]);

    const { data: visitor, error: visitorError } = await auth.supabaseAdmin
      .from("visitors")
      .select("id, company_id, gate_id, status, phone_encrypted, phone")
      .eq("id", safeVisitorId)
      .single();

    if (visitorError || !visitor) {
      return NextResponse.json({ error: "Visitor not found." }, { status: 404 });
    }

    assertCompanyAccess(auth.profile, visitor.company_id);

    if (!["pending", "checked_in"].includes(String(visitor.status))) {
      return NextResponse.json({ error: "OTP can only be sent to active visitors." }, { status: 409 });
    }

    if (auth.profile.role === "guard") {
      const { data: guardProfile } = await auth.supabaseAdmin
        .from("profiles")
        .select("gate_id")
        .eq("id", auth.profile.id)
        .eq("company_id", visitor.company_id)
        .single();

      if (guardProfile?.gate_id && visitor.gate_id && guardProfile.gate_id !== visitor.gate_id) {
        return NextResponse.json({ error: "You can only message visitors assigned to your gate." }, { status: 403 });
      }
    }

    const decryptedPhone = decryptValue(visitor.phone_encrypted) || visitor.phone || "";
    const normalizedPhone = `+${requireKenyanPhoneNumber(decryptedPhone)}`;

    const username = process.env.AFRICASTALKING_USERNAME?.trim();
    const apiKey = process.env.AFRICASTALKING_API_KEY?.trim();
    const senderId = process.env.AFRICASTALKING_SENDER_ID?.trim();

    if (!username || !apiKey) {
      return NextResponse.json({ error: "SMS could not be sent." }, { status: 500 });
    }

    let code = createOtpCode();
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const { data: existing } = await auth.supabaseAdmin
        .from("visitors")
        .select("id")
        .eq("otp_code", code)
        .in("status", ["pending", "checked_in"])
        .limit(1);

      if (!existing?.length) break;
      code = createOtpCode();
    }

    const { error: updateError } = await auth.supabaseAdmin
      .from("visitors")
      .update({ otp_code: code })
      .eq("id", visitor.id);
    if (updateError) throw updateError;

    const client = africastalking({ username, apiKey });
    const smsResponse = (await client.SMS.send({
      to: [normalizedPhone],
      message: `Your building entry code is: ${code}`,
      ...(senderId ? { from: senderId } : {}),
    })) as AfricaTalkingSmsResponse;

    const rejectedRecipient = (smsResponse.SMSMessageData?.Recipients || []).find(recipientLooksRejected);
    if (rejectedRecipient) {
      await auth.supabaseAdmin.from("visitors").update({ otp_code: null }).eq("id", visitor.id);
      return NextResponse.json({ error: "SMS could not be sent." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Visitor OTP send failed:", error);
    const safeError = getSafeErrorResponse(error, "OTP was not sent.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status >= 500 ? safeError.status : 502 });
  }
}
