import { NextResponse } from "next/server";
import { createSupabaseAdmin, reconcileCompanyBilling } from "@/lib/billing/server";
import { getPayHeroTransactionStatus, normalizePayHeroStatus } from "@/lib/payhero";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing transaction reference." }, { status: 400 });
    }

    const statusData = await getPayHeroTransactionStatus(reference);
    const rawStatus = statusData.Status || statusData.status;
    const rawResultCode = statusData.ResultCode || statusData.result_code;
    const normalizedStatus = normalizePayHeroStatus(
      typeof rawStatus === "string" ? rawStatus : null,
      typeof rawResultCode === "string" || typeof rawResultCode === "number" ? rawResultCode : null
    );
    const supabaseAdmin = createSupabaseAdmin();

    const { data: existingRows } = await supabaseAdmin
      .from("transactions")
      .select("id, company_id, paid_at, reversed_at")
      .eq("provider", "payhero")
      .or(`provider_reference.eq.${reference},checkout_request_id.eq.${reference},tracking_id.eq.${reference}`)
      .limit(1);

    const existing = existingRows?.[0];
    if (existing) {
      await supabaseAdmin
        .from("transactions")
        .update({
          status: normalizedStatus,
          raw_callback_payload: statusData,
          updated_at: new Date().toISOString(),
          paid_at: normalizedStatus === "paid" ? new Date().toISOString() : existing.paid_at,
          reversed_at: normalizedStatus === "reversed" ? new Date().toISOString() : existing.reversed_at,
        })
        .eq("id", existing.id);

      await reconcileCompanyBilling(existing.company_id);
    }

    return NextResponse.json({ success: true, status: normalizedStatus, providerStatus: statusData });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check PayHero status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
