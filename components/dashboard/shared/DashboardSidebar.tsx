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
    <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">
      {navItems.map((item) => {
        const active = isActive(pathname, item);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-bold transition-all",
              active && !item.danger && "bg-blue-50 text-blue-700",
              active && item.danger && "bg-red-50 text-red-600",
              !active && "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center transition-colors",
                active
                  ? item.danger ? "text-red-600" : "text-blue-700"
                  : "text-slate-400 group-hover:text-slate-600"
              )}
            >
              <Icon className="h-5 w-5" />
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
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4 shadow-sm md:hidden">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900">{brand}</h2>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
            {subtitle}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onMobileOpenChange(true)} aria-label="Open menu" className="text-slate-600">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          />
          <div className="relative flex h-full w-80 max-w-[86%] flex-col border-r border-slate-100 bg-white shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div>
                <h2 className="text-lg font-black tracking-tight text-slate-900">{brand}</h2>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                  {subtitle}
                </p>
              </div>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-900" onClick={() => onMobileOpenChange(false)} aria-label="Close menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <NavLinks pathname={pathname} navItems={navItems} onNavigate={() => onMobileOpenChange(false)} />
            <div className="border-t border-slate-100 p-4">
              <Button variant="ghost" className="w-full justify-start text-slate-500 hover:bg-slate-50 hover:text-red-600 font-bold" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden h-full w-72 shrink-0 flex-col border-r border-slate-100 bg-white md:flex z-10">
        <div className="border-b border-slate-100 p-5">
          <div className="rounded-[1.4rem] border border-blue-100 bg-blue-50/30 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">{brand}</h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-blue-600">{subtitle}</p>
              </div>
              <div className="rounded-xl p-2 bg-blue-100 text-blue-700">
                <ChevronsUpDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        <NavLinks pathname={pathname} navItems={navItems} />
        <div className="border-t border-slate-100 p-4">
          <Button variant="ghost" className="w-full justify-start text-slate-500 hover:bg-slate-50 hover:text-red-600 font-bold" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
