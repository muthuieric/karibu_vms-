import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, FileSearch, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type StateBlockProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "danger" | "success" | "warning";
};

const toneMap = {
  default: "bg-primary/10 text-primary border-primary/15",
  danger: "bg-destructive/10 text-destructive border-destructive/15",
  success: "bg-success/10 text-success border-success/15",
  warning: "bg-warning/15 text-warning-foreground border-warning/20",
};

export function EmptyState({
  title,
  description,
  icon: Icon = FileSearch,
  children,
  className,
  tone = "default",
}: StateBlockProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-8 text-center", className)}>
      <div className={cn("mb-4 rounded-2xl border p-3", toneMap[tone])}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-base font-bold text-text-main">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm leading-6 text-text-muted">{description}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  icon: Icon = AlertCircle,
  children,
  className,
}: StateBlockProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Icon}
      className={className}
      tone="danger"
    >
      {children}
    </EmptyState>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-surface p-8 text-sm font-semibold text-text-muted shadow-card">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      {label}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-surface p-4 shadow-card">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-14 animate-pulse rounded-xl bg-surface-muted" />
      ))}
    </div>
  );
}
