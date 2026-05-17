import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBillingPeriod, normalizePlan } from "@/lib/billing/pricing";

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42703" || candidate.code === "PGRST204" || /column .* does not exist|Could not find .* column/i.test(candidate.message || "");
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { companyId, planTier } = await request.json();

    if (!companyId || !planTier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPlan = normalizePlan(planTier);
    let companyResult = await supabaseAdmin
      .from("companies")
      .select("plan_tier, pending_plan_tier, pending_plan_effective_at, billing_period_end")
      .eq("id", companyId)
      .single();

    if (isMissingColumnError(companyResult.error)) {
      companyResult = await supabaseAdmin
        .from("companies")
        .select("plan_tier, billing_period_end")
        .eq("id", companyId)
        .single();
    }

    const { data: company, error: fetchError } = companyResult;

    if (fetchError) throw fetchError;

    const currentPlan = normalizePlan(company?.plan_tier);
    const isDowngrade = currentPlan === "premium" && newPlan === "basic";
    const { periodEnd: currentPeriodEnd } = getBillingPeriod();
    const periodEnd = company?.billing_period_end || currentPeriodEnd;
    const updatePayload = isDowngrade
      ? { pending_plan_tier: newPlan, pending_plan_effective_at: periodEnd }
      : { plan_tier: newPlan, pending_plan_tier: null, pending_plan_effective_at: null };

    const { error: updateError } = await supabaseAdmin.from("companies").update(updatePayload).eq("id", companyId);

    if (updateError) throw updateError;

    // Ensure all guards are unlocked regardless of plan
    await supabaseAdmin
      .from("profiles")
      .update({ is_locked: false })
      .eq("company_id", companyId)
      .eq("role", "guard");

    return NextResponse.json({
      success: true,
      newTier: isDowngrade ? currentPlan : newPlan,
      pendingTier: isDowngrade ? newPlan : null,
      effectiveAt: isDowngrade ? periodEnd : null,
    });

  } catch (error: unknown) {
    console.error("Update Plan Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
