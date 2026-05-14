import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status:
    | "checked_in"
    | "checked_out"
    | "auto_checked_out"
    | "pending"
    | "denied"
    | "blacklisted"
    | "locked"
    | "manual_override"
    | "active"
    | "success"
    | "paid"
    | "trial"
    | "neutral"
    | string;
  children?: ReactNode;
  className?: string;
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "pending" | "error" | "info" }> = {
  checked_in: { label: "Checked In", variant: "success" },
  active: { label: "Active", variant: "success" },
  success: { label: "Success", variant: "success" },
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "pending" },
  trial: { label: "Trial", variant: "pending" },
  checked_out: { label: "Checked Out", variant: "secondary" },
  auto_checked_out: { label: "Auto Checked Out", variant: "info" },
  neutral: { label: "Neutral", variant: "secondary" },
  denied: { label: "Denied", variant: "error" },
  blacklisted: { label: "Blacklisted", variant: "error" },
  locked: { label: "Locked", variant: "error" },
  manual_override: { label: "Inside (Override)", variant: "info" },
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status.replace(/_/g, " "), variant: "secondary" as const };

  return (
    <Badge variant={config.variant} className={cn("gap-1.5 capitalize", className)}>
      {children ?? config.label}
    </Badge>
  );
}
