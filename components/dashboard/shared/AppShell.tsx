import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppSurfaceProps = {
  children: ReactNode;
  className?: string;
  variant?: "admin" | "guard" | "superadmin" | "public";
};

export function AppSurface({ children, className, variant = "admin" }: AppSurfaceProps) {
  const accent =
    variant === "superadmin"
      ? "from-orange-500/12 via-blue-500/8"
      : variant === "guard"
        ? "from-emerald-500/12 via-blue-500/8"
        : "from-blue-500/12 via-orange-500/8";

  return (
    <div className={cn("relative min-h-full overflow-hidden bg-[#F8FAFC]", className)}>
      <div className={cn("pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops),transparent_34rem)]", accent)} />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.08)_0,transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.75),rgba(248,250,252,0.94))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl space-y-7 p-4 md:p-6 lg:p-8", className)}>
      {children}
    </div>
  );
}
