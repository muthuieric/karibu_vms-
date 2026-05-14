"use client";

import { CheckCircle2, Clock, UserPlus } from "lucide-react";
import { StatCard } from "@/components/dashboard/shared/StatCard";

type GuardStatsProps = {
  totalToday: number;
  pendingCount: number;
  checkedInCount: number;
};

export default function GuardStats({ totalToday, pendingCount, checkedInCount }: GuardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      <StatCard label="Total today" value={totalToday} icon={UserPlus} tone="primary" />
      <StatCard label="Pending" value={pendingCount} icon={Clock} tone="warning" />
      <StatCard label="Checked in" value={checkedInCount} icon={CheckCircle2} tone="success" />
    </div>
  );
}
