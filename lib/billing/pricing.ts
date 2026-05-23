export type BillingPlan =
  | "basic"
  | "premium"
  | "custom"
  | "trial_basic"
  | "trial_premium";

export type BaseBillingPlan = "basic" | "premium" | "custom";

export type PricingSnapshot = {
  planName: BillingPlan;
  basePrice: number;
  includedVisitors: number;
  extraVisitorRate: number;
};

export type BillingCalculation = PricingSnapshot & {
  visitorCount: number;
  extraVisitors: number;
  extraVisitorCharges: number;
  totalAmount: number;
};

export type BillingCalculationOptions = {
  isTrialActive?: boolean;
};

export const BASIC_BASE_PRICE = 10;
export const BASIC_INCLUDED_VISITORS = 500;
export const BASIC_EXTRA_VISITOR_RATE = 2;

export const PREMIUM_BASE_PRICE = 3000;
export const PREMIUM_INCLUDED_VISITORS = 1000;
export const PREMIUM_EXTRA_VISITOR_RATE = 3;

export const BILLING_PLANS: Record<BillingPlan, PricingSnapshot> = {
  basic: {
    planName: "basic",
    basePrice: BASIC_BASE_PRICE,
    includedVisitors: BASIC_INCLUDED_VISITORS,
    extraVisitorRate: BASIC_EXTRA_VISITOR_RATE,
  },
  premium: {
    planName: "premium",
    basePrice: PREMIUM_BASE_PRICE,
    includedVisitors: PREMIUM_INCLUDED_VISITORS,
    extraVisitorRate: PREMIUM_EXTRA_VISITOR_RATE,
  },
  custom: {
    planName: "custom",
    basePrice: 0,
    includedVisitors: 0,
    extraVisitorRate: 0,
  },
  trial_basic: {
    planName: "trial_basic",
    basePrice: 0,
    includedVisitors: BASIC_INCLUDED_VISITORS,
    extraVisitorRate: BASIC_EXTRA_VISITOR_RATE,
  },
  trial_premium: {
    planName: "trial_premium",
    basePrice: 0,
    includedVisitors: PREMIUM_INCLUDED_VISITORS,
    extraVisitorRate: PREMIUM_EXTRA_VISITOR_RATE,
  },
};

export function normalizePlan(plan?: string | null): BillingPlan {
  const normalized = String(plan || "").toLowerCase().trim();
  if (normalized === "premium") return "premium";
  if (normalized === "custom") return "custom";
  if (normalized === "trial_basic" || normalized === "trial-basic" || normalized === "trial basic") return "trial_basic";
  if (normalized === "trial_premium" || normalized === "trial-premium" || normalized === "trial premium") return "trial_premium";
  return "basic";
}

export function isTrialPlan(plan?: string | null) {
  const normalized = normalizePlan(plan);
  return normalized === "trial_basic" || normalized === "trial_premium";
}

export function getBasePlan(plan?: string | null): BaseBillingPlan {
  const normalized = normalizePlan(plan);
  if (normalized === "trial_basic") return "basic";
  if (normalized === "trial_premium") return "premium";
  return normalized;
}

export function getPricingSnapshot(plan?: string | null): PricingSnapshot {
  return BILLING_PLANS[normalizePlan(plan)];
}

export function calculateMonthlyCharge(
  plan: string | null | undefined,
  visitorCount: number,
  options: BillingCalculationOptions = {}
): BillingCalculation {
  const normalizedPlan = normalizePlan(plan);
  const basePlan = getBasePlan(normalizedPlan);
  const baseSnapshot = BILLING_PLANS[basePlan];
  const trialActive = isTrialPlan(normalizedPlan) && options.isTrialActive === true;
  const safeVisitorCount = Math.max(0, Math.floor(Number(visitorCount) || 0));
  const extraVisitors = Math.max(0, safeVisitorCount - baseSnapshot.includedVisitors);
  const extraVisitorCharges = trialActive ? 0 : extraVisitors * baseSnapshot.extraVisitorRate;

  return {
    planName: normalizedPlan,
    basePrice: trialActive ? 0 : baseSnapshot.basePrice,
    includedVisitors: baseSnapshot.includedVisitors,
    extraVisitorRate: baseSnapshot.extraVisitorRate,
    visitorCount: safeVisitorCount,
    extraVisitors,
    extraVisitorCharges,
    totalAmount: trialActive ? 0 : baseSnapshot.basePrice + extraVisitorCharges,
  };
}

export function addOneMonth(date: Date) {
  const next = new Date(date);
  const day = next.getDate();
  next.setMonth(next.getMonth() + 1);

  if (next.getDate() !== day) {
    next.setDate(0);
  }

  return next;
}

export function getBillingPeriod(date = new Date()) {
  const periodStart = new Date(date);
  const periodEnd = addOneMonth(periodStart);

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    periodKey: `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, "0")}-${String(periodStart.getUTCDate()).padStart(2, "0")}`,
  };
}

export function getPlanLabel(plan?: string | null) {
  const normalized = normalizePlan(plan);
  if (normalized === "premium") return "Premium";
  if (normalized === "custom") return "Custom";
  if (normalized === "trial_basic") return "Trial (Basic)";
  if (normalized === "trial_premium") return "Trial (Premium)";
  return "Basic";
}
