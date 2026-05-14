import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTone = "primary" | "success" | "warning" | "danger" | "neutral";

type StatCardProps = {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: LucideIcon;
  tone?: StatTone;
  className?: string;
};

const toneMap: Record<StatTone, { icon: string; accent: string; value: string }> = {
  primary: {
    icon: "bg-primary/10 text-primary border-primary/15",
    accent: "from-primary/14",
    value: "text-primary",
  },
  success: {
    icon: "bg-success/10 text-success border-success/15",
    accent: "from-success/14",
    value: "text-success",
  },
  warning: {
    icon: "bg-warning/15 text-warning-foreground border-warning/20",
    accent: "from-warning/20",
    value: "text-warning-foreground",
  },
  danger: {
    icon: "bg-destructive/10 text-destructive border-destructive/15",
    accent: "from-destructive/14",
    value: "text-destructive",
  },
  neutral: {
    icon: "bg-surface-muted text-text-muted border-border",
    accent: "from-surface-muted",
    value: "text-text-main",
  },
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "primary",
  className,
}: StatCardProps) {
  const styles = toneMap[tone];

  return (
    <Card className={cn("relative overflow-hidden border-white/70 bg-white/85 backdrop-blur", className)}>
      <div className={cn("absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br to-transparent blur-2xl", styles.accent)} />
      <CardContent className="relative flex min-h-36 flex-col justify-between gap-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-[10rem] text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
          {Icon && (
            <div className={cn("rounded-2xl border p-3 shadow-sm", styles.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className={cn("mt-2 text-3xl font-bold tracking-tight md:text-4xl", styles.value)}>
            {value}
          </div>
          {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
