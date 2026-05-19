import africastalking from "africastalking";
import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { optionalText, requireKenyanPhoneNumber, requireUuid } from "@/lib/validation";

type SmsRecipient = {
  status?: string;
  statusCode?: number | string;
  number?: string;
  messageId?: string;
};

type AfricaTalkingSmsResponse = {
  SMSMessageData?: {
    Message?: string;
    Recipients?: SmsRecipient[];
  };
};

function getSafeProviderError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 300);

  try {
    return JSON.stringify(error).slice(0, 300);
  } catch {
    return "Unknown SMS provider error.";
  }
}

function recipientLooksRejected(recipient: SmsRecipient) {
  const status = String(recipient.status || "").toLowerCase();
  const statusCode = Number(recipient.statusCode);

  return (
    (Number.isFinite(statusCode) && statusCode >= 400) ||
    /failed|invalid|rejected|error|insufficient|not sent/.test(status)
  );
}

export async function POST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, { keyPrefix: "sms", limit: 10, windowMs: 60_000 });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { phone, message, companyId } = await request.json();
    const safeCompanyId = requireUuid(companyId, "companyId");
    const { profile } = await requireRole(request, ["guard", "company_admin", "superadmin"]);
    assertCompanyAccess(profile, safeCompanyId);

    const username = process.env.AFRICASTALKING_USERNAME?.trim();
    const apiKey = process.env.AFRICASTALKING_API_KEY?.trim();
    const senderId = process.env.AFRICASTALKING_SENDER_ID?.trim();

    if (!username || !apiKey) {
      console.error("Missing Africa's Talking SMS credentials.", {
        hasUsername: Boolean(username),
        hasApiKey: Boolean(apiKey),
      });
      return NextResponse.json({ error: "SMS could not be sent." }, { status: 500 });
    }

    const normalizedPhone = `+${requireKenyanPhoneNumber(phone)}`;
    const safeMessage = optionalText(message, 320);
    if (!safeMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const client = africastalking({ username, apiKey });
    const smsResponse = (await client.SMS.send({
      to: [normalizedPhone],
      message: safeMessage,
      ...(senderId ? { from: senderId } : {}),
    })) as AfricaTalkingSmsResponse;

    const recipients = smsResponse.SMSMessageData?.Recipients || [];
    const rejectedRecipient = recipients.find(recipientLooksRejected);

    if (rejectedRecipient) {
      console.error("Africa's Talking SMS recipient rejected:", {
        status: rejectedRecipient.status,
        statusCode: rejectedRecipient.statusCode,
        hasUsername: Boolean(username),
        hasApiKey: Boolean(apiKey),
        hasSenderId: Boolean(senderId),
      });
      return NextResponse.json({ error: "SMS could not be sent." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Africa's Talking SMS error:", {
      message: getSafeProviderError(error),
      hasUsername: Boolean(process.env.AFRICASTALKING_USERNAME?.trim()),
      hasApiKey: Boolean(process.env.AFRICASTALKING_API_KEY?.trim()),
      hasSenderId: Boolean(process.env.AFRICASTALKING_SENDER_ID?.trim()),
    });
    const safeError = getSafeErrorResponse(error, "SMS could not be sent.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status >= 500 ? safeError.status : 502 });
  }
}
