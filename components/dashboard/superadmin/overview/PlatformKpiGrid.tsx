"use client";

import { Activity, Banknote, Building2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type PlatformStats = {
  totalCompanies: number;
  activeCompanies: number;
  totalRevenue: number;
  totalVisitors: number;
  todayVisitors: number;
  totalGuards: number;
  pendingVisitors: number;
  insideVisitors: number;
};

type PlatformKpiGridProps = {
  stats: PlatformStats;
};

export default function PlatformKpiGrid({ stats }: PlatformKpiGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="border-0 border-l-4 border-l-emerald-500 shadow-sm bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Revenue</p>
            <Banknote className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-bold text-emerald-600">KES</span>
            <span className="text-3xl font-black text-zinc-900 tracking-tight">{stats.totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 font-bold">Total Platform Earnings</p>
        </CardContent>
      </Card>

      <Card className="border-0 border-l-4 border-l-blue-500 shadow-sm bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Clients</p>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-zinc-900 tracking-tight">{stats.totalCompanies}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">{stats.activeCompanies} Active Subscriptions</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 border-l-4 border-l-indigo-500 shadow-sm bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Guards</p>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-zinc-900 tracking-tight">{stats.totalGuards}</div>
          <p className="text-[10px] text-zinc-400 mt-1 font-bold uppercase tracking-tight">Active Accounts Deployed</p>
        </CardContent>
      </Card>

      <Card className="border-0 border-l-4 border-l-zinc-900 shadow-sm bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Lifetime Visitors</p>
            <Activity className="w-4 h-4 text-zinc-900" />
          </div>
          <div className="text-3xl font-black text-zinc-900 tracking-tight">{stats.totalVisitors.toLocaleString()}</div>
          <p className="text-[10px] text-zinc-400 mt-1 font-bold uppercase tracking-tight">Records Processed to Date</p>
        </CardContent>
      </Card>
    </div>
  );
}
