import { NextResponse } from "next/server";
import { assertCompanyAccess, getSafeErrorResponse, requireRole } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { optionalText, requireKenyanPhoneNumber, requireUuid } from "@/lib/validation";

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
    if (!username || !apiKey) {
      console.error("Missing Africa's Talking SMS credentials.");
      return NextResponse.json({ error: "SMS could not be sent." }, { status: 500 });
    }

    const normalizedPhone = `+${requireKenyanPhoneNumber(phone)}`;
    const safeMessage = optionalText(message, 320);
    if (!safeMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const body = new URLSearchParams({
      username,
      to: normalizedPhone,
      message: safeMessage,
    });

    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Africa's Talking SMS error:", { status: response.status, body: text.slice(0, 300) });
      return NextResponse.json({ error: "SMS could not be sent." }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SMS Error:", error);
    const safeError = getSafeErrorResponse(error, "SMS could not be sent.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
