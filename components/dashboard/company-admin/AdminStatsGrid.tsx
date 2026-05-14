"use client";

import { Clock, History, ShieldCheck, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/shared/StatCard";

type AdminStatsGridProps = {
  totalToday: number;
  currentlyInside: number;
  pendingCount: number;
  lifetimeVisitors: number;
};

export default function AdminStatsGrid({
  totalToday,
  currentlyInside,
  pendingCount,
  lifetimeVisitors,
}: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard label="Total visitors today" value={totalToday} icon={Users} tone="primary" />
      <StatCard label="Currently inside" value={currentlyInside} icon={ShieldCheck} tone="success" />
      <StatCard label="Pending approvals" value={pendingCount} icon={Clock} tone="warning" />
      <StatCard label="Lifetime visitors" value={lifetimeVisitors.toLocaleString()} icon={History} tone="neutral" />
    </div>
  );
}
