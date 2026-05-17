import { NextResponse } from "next/server";
import { getCurrentBillingSummary, createSupabaseAdmin } from "@/lib/billing/server";
import { initiatePayHeroPayment } from "@/lib/payhero";

function normalizePhoneNumber(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export async function POST(req: Request) {
  try {
    const { companyId, phoneNumber } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: "Missing companyId." }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(String(phoneNumber || ""));
    if (!/^254\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json({ error: "Enter a valid Kenyan M-Pesa phone number." }, { status: 400 });
    }

    const channelId = process.env.PAYHERO_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json({ error: "Missing PayHero channel configuration." }, { status: 500 });
    }

    const summary = await getCurrentBillingSummary(companyId);
    if (summary.currentBalance <= 0) {
      return NextResponse.json({ error: "Your account is already settled." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const callbackUrl = process.env.PAYHERO_CALLBACK_URL || `${appUrl}/api/payhero/callback`;
    const externalReference = `KRB-${companyId}-${summary.periodKey}-${Date.now()}`;
    const response = await initiatePayHeroPayment({
      amount: summary.currentBalance,
      phoneNumber: normalizedPhone,
      channelId,
      externalReference,
      callbackUrl,
    });

    const checkoutRequestId =
      response.CheckoutRequestID || response.CheckoutRequestId || response.checkout_request_id || response.checkoutRequestId || response.reference;

    const supabaseAdmin = createSupabaseAdmin();
    await supabaseAdmin.from("transactions").insert({
      company_id: companyId,
      amount: summary.currentBalance,
      currency: "KES",
      provider: "payhero",
      tracking_id: String(checkoutRequestId || externalReference),
      provider_reference: String(response.reference || checkoutRequestId || externalReference),
      checkout_request_id: checkoutRequestId ? String(checkoutRequestId) : null,
      external_reference: externalReference,
      phone_number: normalizedPhone,
      status: "pending",
      billing_period_key: summary.periodKey,
      billing_period_start: summary.periodStart,
      billing_period_end: summary.periodEnd,
      plan_name: summary.planName,
      base_price: summary.basePrice,
      included_visitors: summary.includedVisitors,
      extra_visitor_rate: summary.extraVisitorRate,
      visitor_count: summary.visitorCount,
      extra_visitors: summary.extraVisitors,
      extra_visitor_charges: summary.extraVisitorCharges,
      total_amount: summary.totalAmount,
      current_balance: summary.currentBalance,
      raw_initiate_response: response,
    });

    return NextResponse.json({
      success: true,
      status: "pending",
      reference: String(checkoutRequestId || externalReference),
      externalReference,
      message: response.message || "M-Pesa prompt sent. Complete the payment on your phone.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to initiate PayHero payment.";
    console.error("PayHero initiate error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
