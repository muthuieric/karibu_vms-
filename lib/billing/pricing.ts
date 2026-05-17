export type BillingPlan = "basic" | "premium";

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

export const BASIC_BASE_PRICE = 1500;
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
};

export function normalizePlan(plan?: string | null): BillingPlan {
  return plan?.toLowerCase() === "premium" ? "premium" : "basic";
}

export function getPricingSnapshot(plan?: string | null): PricingSnapshot {
  return BILLING_PLANS[normalizePlan(plan)];
}

export function calculateMonthlyCharge(plan: string | null | undefined, visitorCount: number): BillingCalculation {
  const snapshot = getPricingSnapshot(plan);
  const safeVisitorCount = Math.max(0, Math.floor(Number(visitorCount) || 0));
  const extraVisitors = Math.max(0, safeVisitorCount - snapshot.includedVisitors);
  const extraVisitorCharges = extraVisitors * snapshot.extraVisitorRate;

  return {
    ...snapshot,
    visitorCount: safeVisitorCount,
    extraVisitors,
    extraVisitorCharges,
    totalAmount: snapshot.basePrice + extraVisitorCharges,
  };
}

export function getBillingPeriod(date = new Date()) {
  const periodStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    periodKey: `${periodStart.getUTCFullYear()}-${String(periodStart.getUTCMonth() + 1).padStart(2, "0")}`,
  };
}

export function getPlanLabel(plan?: string | null) {
  return normalizePlan(plan) === "premium" ? "Premium" : "Basic";
}
