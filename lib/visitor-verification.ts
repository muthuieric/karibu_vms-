import { getBasePlan, parseBillingPlan } from "@/lib/billing/pricing";

export type VisitorVerificationMethod = "qr_pass" | "sms_otp";

const ELIGIBLE_VERIFICATION_PLANS = new Set(["premium", "trial_premium", "custom"]);

export function isVerificationMethod(value: unknown): value is VisitorVerificationMethod {
  return value === "qr_pass" || value === "sms_otp";
}

export function getVerificationPlanState(plan?: string | null): "eligible" | "locked" | "unknown" {
  const normalized = parseBillingPlan(plan);
  if (!normalized) return "unknown";
  if (ELIGIBLE_VERIFICATION_PLANS.has(normalized)) return "eligible";
  return "locked";
}

export function canChooseVerificationMethod(plan?: string | null) {
  return getVerificationPlanState(plan) === "eligible";
}

export function isBasicQrPassTestingAllowed(plan?: string | null) {
  return (
    process.env.NODE_ENV !== "production" &&
    parseBillingPlan(plan) === "basic" &&
    process.env.ENABLE_BASIC_QR_PASS_TESTING === "true"
  );
}

export function isQrPassBackendEnabledForPlan(plan?: string | null) {
  return process.env.ENABLE_QR_PASS === "true" && (canChooseVerificationMethod(plan) || isBasicQrPassTestingAllowed(plan));
}

export function isQrPassFrontendEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_QR_PASS === "true";
}

export function resolveVisitorVerificationMethod(
  plan?: string | null,
  method?: string | null
): VisitorVerificationMethod | "basic_default" {
  if (getBasePlan(plan) === "basic") return "basic_default";
  if (!canChooseVerificationMethod(plan)) return "basic_default";
  return isVerificationMethod(method) ? method : "qr_pass";
}

export function resolveEffectiveVisitorVerificationMethod(
  plan?: string | null,
  visitorMethod?: string | null,
  companyMethod?: string | null
): VisitorVerificationMethod | "basic_default" {
  if (getBasePlan(plan) === "basic") return "basic_default";
  if (!canChooseVerificationMethod(plan)) return "basic_default";
  return isVerificationMethod(visitorMethod)
    ? visitorMethod
    : resolveVisitorVerificationMethod(plan, companyMethod);
}
