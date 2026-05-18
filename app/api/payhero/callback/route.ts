import { NextResponse } from "next/server";
import { createSupabaseAdmin, markCompanyPaymentSuccessful, reconcileCompanyBilling } from "@/lib/billing/server";
import { getPayHeroExternalReference, getPayHeroReference, normalizePayHeroStatus } from "@/lib/payhero";

function getPayloadValue(payload: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    if (payload[key] !== undefined && payload[key] !== null) return payload[key];
  }
  return null;
}

function companyIdFromExternalReference(reference: string) {
  const match = reference.match(/^KRB-([0-9a-f-]{36})-/i);
  return match?.[1] || null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = (body.response && typeof body.response === "object" ? body.response : body) as Record<string, unknown>;
    const providerReference = getPayHeroReference(payload);
    const externalReference = getPayHeroExternalReference(payload);
    const rawStatus = getPayloadValue(payload, ["Status", "status"]);
    const resultCode = getPayloadValue(payload, ["ResultCode", "result_code", "resultCode"]);
    const status = normalizePayHeroStatus(String(rawStatus || ""), resultCode as string | number | null);

    if (!providerReference && !externalReference) {
      return NextResponse.json({ error: "Missing PayHero transaction reference." }, { status: 400 });
    }

    const supabaseAdmin = createSupabaseAdmin();
    const query = supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("provider", "payhero")
      .or(
        [
          providerReference ? `provider_reference.eq.${providerReference}` : "",
          providerReference ? `checkout_request_id.eq.${providerReference}` : "",
          providerReference ? `tracking_id.eq.${providerReference}` : "",
          externalReference ? `external_reference.eq.${externalReference}` : "",
        ]
          .filter(Boolean)
          .join(",")
      )
      .order("created_at", { ascending: false })
      .limit(1);

    const { data: existingRows, error: fetchError } = await query;
    if (fetchError) {
      throw fetchError;
    }

    const existing = existingRows?.[0];
    const companyId = existing?.company_id || companyIdFromExternalReference(externalReference);
    if (!companyId) {
      return NextResponse.json({ error: "Unable to match callback to a company." }, { status: 400 });
    }

    const amount = Number(getPayloadValue(payload, ["Amount", "amount"]) || existing?.amount || 0);
    const paidAt = status === "paid" ? new Date().toISOString() : existing?.paid_at || null;
    const reversedAt = status === "reversed" ? new Date().toISOString() : existing?.reversed_at || null;
    const wasAlreadyPaid = String(existing?.status || "").toLowerCase() === "paid";
    const paidPeriod = status === "paid" && paidAt && !wasAlreadyPaid ? await markCompanyPaymentSuccessful(companyId, paidAt, amount) : null;
    const updatePayload = {
      company_id: companyId,
      amount,
      currency: "KES",
      provider: "payhero",
      provider_reference: providerReference || existing?.provider_reference || externalReference,
      checkout_request_id: providerReference || existing?.checkout_request_id || null,
      external_reference: externalReference || existing?.external_reference || null,
      tracking_id: providerReference || existing?.tracking_id || externalReference,
      phone_number: String(getPayloadValue(payload, ["Phone", "phone", "phone_number", "PhoneNumber"]) || existing?.phone_number || ""),
      mpesa_receipt_number: String(getPayloadValue(payload, ["MpesaReceiptNumber", "mpesa_receipt_number"]) || existing?.mpesa_receipt_number || ""),
      status,
      raw_callback_payload: body,
      updated_at: new Date().toISOString(),
      paid_at: paidAt,
      reversed_at: reversedAt,
      ...(paidPeriod
        ? {
            billing_period_key: paidPeriod.periodKey,
            billing_period_start: paidPeriod.periodStart,
            billing_period_end: paidPeriod.periodEnd,
            current_balance: 0,
          }
        : {}),
    };

    if (existing) {
      await supabaseAdmin.from("transactions").update(updatePayload).eq("id", existing.id);
    } else {
      await supabaseAdmin.from("transactions").insert(updatePayload);
    }

    if (status !== "paid") {
      await reconcileCompanyBilling(companyId);
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PayHero callback failed.";
    console.error("PayHero callback error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
