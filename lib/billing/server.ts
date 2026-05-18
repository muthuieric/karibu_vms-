import { createClient } from "@supabase/supabase-js";
import { calculateMonthlyCharge, getBillingPeriod, normalizePlan } from "@/lib/billing/pricing";
import type { BillingPlan } from "@/lib/billing/pricing";

export function createSupabaseAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function isMissingColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === "42703" || candidate.code === "PGRST204" || /column .* does not exist|Could not find .* column/i.test(candidate.message || "");
}

function isPaidStatus(status?: string | null) {
  const normalized = String(status || "").toLowerCase();
  return normalized === "paid" || normalized === "completed" || normalized === "success";
}

type CompanyBillingFields = {
  plan_tier?: string | null;
  pending_plan_tier?: string | null;
  pending_plan_effective_at?: string | null;
  plan_change_effective_at?: string | null;
};

function getPendingPlanEffectiveAt(company: CompanyBillingFields) {
  return company.pending_plan_effective_at || company.plan_change_effective_at || null;
}

async function applyPendingPlanIfDue(
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin>,
  companyId: string,
  company: CompanyBillingFields
): Promise<BillingPlan> {
  const currentPlan = normalizePlan(company.plan_tier);
  const pendingPlan = company.pending_plan_tier ? normalizePlan(company.pending_plan_tier) : null;
  const effectiveAt = getPendingPlanEffectiveAt(company);
  const effectiveDate = effectiveAt ? new Date(effectiveAt) : null;

  if (!pendingPlan || !effectiveDate || Number.isNaN(effectiveDate.getTime()) || effectiveDate > new Date()) {
    return currentPlan;
  }

  const { error } = await supabaseAdmin
    .from("companies")
    .update({
      plan_tier: pendingPlan,
      pending_plan_tier: null,
      pending_plan_effective_at: null,
    })
    .eq("id", companyId);

  if (error) throw error;

  company.plan_tier = pendingPlan;
  company.pending_plan_tier = null;
  company.pending_plan_effective_at = null;
  company.plan_change_effective_at = null;

  return pendingPlan;
}

export async function getCurrentBillingSummary(companyId: string) {
  const supabaseAdmin = createSupabaseAdmin();
  const { periodStart, periodEnd, periodKey } = getBillingPeriod();

  let companyResult = await supabaseAdmin
    .from("companies")
    .select("id, name, created_at, contact_phone, plan_tier, pending_plan_tier, pending_plan_effective_at, is_locked")
    .eq("id", companyId)
    .single();

  if (isMissingColumnError(companyResult.error)) {
    companyResult = await supabaseAdmin
      .from("companies")
      .select("id, name, created_at, contact_phone, plan_tier, pending_plan_tier, plan_change_effective_at, is_locked")
      .eq("id", companyId)
      .single();
  }

  if (isMissingColumnError(companyResult.error)) {
    companyResult = await supabaseAdmin
      .from("companies")
      .select("id, name, created_at, contact_phone, is_locked")
      .eq("id", companyId)
      .single();
  }

  const { data: company, error: companyError } = companyResult;

  if (companyError || !company) {
    throw new Error(companyError?.message || "Company not found.");
  }

  const companyWithBilling = company as typeof company & {
    plan_tier?: string | null;
    pending_plan_tier?: string | null;
    pending_plan_effective_at?: string | null;
    plan_change_effective_at?: string | null;
  };
  const activePlan = await applyPendingPlanIfDue(supabaseAdmin, companyId, companyWithBilling);

  const { count, error: visitorsError } = await supabaseAdmin
    .from("visitors")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId)
    .gte("created_at", periodStart)
    .lt("created_at", periodEnd);

  if (visitorsError) {
    throw new Error("Failed to calculate monthly visitor usage.");
  }

  const calculation = calculateMonthlyCharge(activePlan, count || 0);

  let transactionsResult = await supabaseAdmin
    .from("transactions")
    .select("amount, status")
    .eq("company_id", companyId)
    .eq("billing_period_key", periodKey);

  if (isMissingColumnError(transactionsResult.error)) {
    transactionsResult = await supabaseAdmin
      .from("transactions")
      .select("amount, status")
      .eq("company_id", companyId)
      .gte("created_at", periodStart)
      .lt("created_at", periodEnd);
  }

  if (transactionsResult.error) {
    throw new Error(transactionsResult.error.message);
  }

  const paidAmount = (transactionsResult.data || []).reduce((sum, transaction) => {
    return isPaidStatus(transaction.status) ? sum + Number(transaction.amount || 0) : sum;
  }, 0);

  const currentBalance = Math.max(0, calculation.totalAmount - paidAmount);

  return {
    company,
    periodStart,
    periodEnd,
    periodKey,
    currentPlanTier: activePlan,
    pendingPlanTier: companyWithBilling.pending_plan_tier || null,
    pendingPlanEffectiveAt: getPendingPlanEffectiveAt(companyWithBilling),
    planChangeEffectiveAt: getPendingPlanEffectiveAt(companyWithBilling),
    amountPaid: paidAmount,
    currentBalance,
    ...calculation,
  };
}

export async function reconcileCompanyBilling(companyId: string) {
  const supabaseAdmin = createSupabaseAdmin();
  const summary = await getCurrentBillingSummary(companyId);
  const { data: allPaidTransactions } = await supabaseAdmin
    .from("transactions")
    .select("amount")
    .eq("company_id", companyId)
    .eq("status", "paid");

  const amountPaid = (allPaidTransactions || []).reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  await supabaseAdmin
    .from("companies")
    .update({
      amount_paid: amountPaid,
      current_balance: summary.currentBalance,
      billing_period_start: summary.periodStart,
      billing_period_end: summary.periodEnd,
      subscription_status: summary.currentBalance > 0 ? "unpaid" : "paid",
      // Hard lock is controlled by superadmin unless payment auto-unlock is enabled.
      is_locked: summary.currentBalance > 0 ? summary.company.is_locked : false,
    })
    .eq("id", companyId);

  return summary;
}
