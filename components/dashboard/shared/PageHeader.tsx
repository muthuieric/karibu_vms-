import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "danger" | "success" | "warning" | "dark";
};

const toneClasses = {
  default: "bg-primary/10 text-primary border-primary/15",
  danger: "bg-destructive/10 text-destructive border-destructive/15",
  success: "bg-success/10 text-success border-success/15",
  warning: "bg-warning/15 text-warning-foreground border-warning/20",
  dark: "bg-white/10 text-white border-white/15",
};

export function PageHeader({
  title,
  description,
  eyebrow,
  icon: Icon,
  children,
  className,
  tone = "default",
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-6",
        tone === "dark" && "border-slate-800 bg-slate-950 text-white",
        className
      )}
    >
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {Icon && (
            <div className={cn("mt-0.5 rounded-2xl border p-3 shadow-sm", toneClasses[tone])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className={cn("mb-1 text-xs font-black uppercase tracking-[0.2em] text-primary", tone === "dark" && "text-orange-300")}>
                {eyebrow}
              </p>
            )}
            <h1 className={cn("text-3xl font-black tracking-tight text-slate-950 md:text-4xl", tone === "dark" && "text-white")}>
              {title}
            </h1>
            {description && (
              <p className={cn("mt-2 max-w-2xl text-sm leading-6 text-slate-500 md:text-base", tone === "dark" && "text-slate-300")}>
                {description}
              </p>
            )}
          </div>
        </div>
        {children && <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:justify-end">{children}</div>}
      </div>
    </div>
  );
}
