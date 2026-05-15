export function isPremiumPlan(planTier?: string | null) {
  return (planTier || "basic").toLowerCase() !== "basic";
}

export function canUseHostConfirmation(planTier?: string | null) {
  return isPremiumPlan(planTier);
}

export function normalizeVisitorStatus(status?: string | null) {
  return status === "auto_checked_out" ? "checked_out" : status || "pending";
}

export function getVisitorStatusLabel(status?: string | null, isOverride?: boolean) {
  const normalizedStatus = normalizeVisitorStatus(status);

  if (isOverride && normalizedStatus !== "checked_out") {
    return "Override";
  }

  switch (normalizedStatus) {
    case "pending":
      return "Pending";
    case "checked_in":
      return "Inside";
    case "checked_out":
      return "Departed";
    default:
      return "Departed";
  }
}

export function getHostReviewLabel(hostConfirmed?: boolean) {
  return hostConfirmed ? "Approved by host" : "Waiting for host";
}
