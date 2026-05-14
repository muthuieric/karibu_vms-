"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronsUpDown, LogOut, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  exact?: boolean;
};

type DashboardSidebarProps = {
  brand: string;
  subtitle: string;
  pathname: string;
  navItems: DashboardNavItem[];
  isMobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onLogout: () => void;
  accent?: "primary" | "warning" | "dark";
};

function isActive(pathname: string, item: DashboardNavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLinks({
  pathname,
  navItems,
  onNavigate,
}: {
  pathname: string;
  navItems: DashboardNavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-2 overflow-y-auto p-4">
      {navItems.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all",
              active && !item.danger && "bg-slate-950 text-white shadow-lg shadow-slate-950/10",
              active && item.danger && "bg-destructive text-white shadow-lg shadow-red-500/15",
              !active && "text-slate-500 hover:bg-white hover:text-slate-950 hover:shadow-sm"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors",
                active
                  ? "border-white/15 bg-white/15 text-white"
                  : item.danger
                    ? "border-red-100 bg-red-50 text-red-500 group-hover:bg-red-100"
                    : "border-slate-200 bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({
  brand,
  subtitle,
  pathname,
  navItems,
  isMobileOpen,
  onMobileOpenChange,
  onLogout,
  accent = "primary",
}: DashboardSidebarProps) {
  const accentClass = accent === "warning" ? "text-warning-foreground" : accent === "dark" ? "text-slate-300" : "text-primary";
  const shellClass =
    accent === "dark"
      ? "border-slate-800 bg-slate-950 text-white"
      : "border-white/70 bg-white/80 text-text-main backdrop-blur-xl";
  const titleClass = accent === "dark" ? "text-white" : "text-text-main";

  return (
    <>
      <div className={cn("flex items-center justify-between border-b p-4 shadow-sm md:hidden", shellClass)}>
        <div>
          <h2 className={cn("text-lg font-bold tracking-tight", titleClass)}>{brand}</h2>
          <p className={cn("mt-0.5 text-[10px] font-bold uppercase tracking-wider", accentClass)}>
            {subtitle}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onMobileOpenChange(true)} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          />
          <div className={cn("relative flex h-full w-80 max-w-[86%] flex-col border-r shadow-modal animate-in slide-in-from-left duration-200", shellClass)}>
            <div className="flex items-center justify-between border-b border-inherit p-4">
              <div>
                <h2 className={cn("text-lg font-bold tracking-tight", titleClass)}>{brand}</h2>
                <p className={cn("mt-0.5 text-[10px] font-bold uppercase tracking-wider", accentClass)}>
                  {subtitle}
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => onMobileOpenChange(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavLinks pathname={pathname} navItems={navItems} onNavigate={() => onMobileOpenChange(false)} />
            <div className="border-t border-inherit p-4">
              <Button variant="ghost" className="w-full justify-start text-text-muted hover:text-destructive" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      <aside className={cn("hidden h-full w-72 shrink-0 flex-col border-r md:flex", shellClass)}>
        <div className="border-b border-inherit p-5">
          <div className={cn("rounded-[1.35rem] border p-4", accent === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-white")}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className={cn("text-xl font-bold tracking-tight", titleClass)}>{brand}</h2>
                <p className={cn("mt-1 text-xs font-bold uppercase tracking-wider", accentClass)}>{subtitle}</p>
              </div>
              <div className={cn("rounded-2xl p-2", accent === "dark" ? "bg-white/10 text-white" : "bg-primary/10 text-primary")}>
                <ChevronsUpDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        <NavLinks pathname={pathname} navItems={navItems} />
        <div className="border-t border-inherit p-4">
          <Button variant="ghost" className="w-full justify-start text-text-muted hover:text-destructive" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
