export function isPremiumPlan(planTier?: string | null) {
  return (planTier || "basic").toLowerCase() !== "basic";
}

export function canUseHostConfirmation(planTier?: string | null) {
  return isPremiumPlan(planTier);
}

export function normalizeVisitorStatus(status?: string | null) {
  return status === "auto_checked_out" ? "checked_out" : status || "pending";
}

export function isPreviousDayVisit(createdAt?: string | null, now = new Date()) {
  if (!createdAt) return false;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  return created < startOfToday;
}

export function isOverdueCheckout(status?: string | null, createdAt?: string | null) {
  return normalizeVisitorStatus(status) === "checked_in" && isPreviousDayVisit(createdAt);
}

export function getVisitorStatusLabel(status?: string | null, isOverride?: boolean, createdAt?: string | null) {
  const normalizedStatus = normalizeVisitorStatus(status);

  if (isOverride && normalizedStatus !== "checked_out") {
    return "Override";
  }

  if (isOverdueCheckout(status, createdAt)) {
    return "Overdue Checkout";
  }

  switch (normalizedStatus) {
    case "pending":
      return "Pending";
    case "expired":
      return "Expired";
    case "checked_in":
      return "Inside";
    case "checked_out":
      return "Departed";
    default:
      return "Requires Review";
  }
}

export function getHostReviewLabel(hostConfirmed?: boolean) {
  return hostConfirmed ? "Confirmed by host" : "Waiting for host";
}
