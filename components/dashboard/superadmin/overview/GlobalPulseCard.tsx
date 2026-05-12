"use client";

import { Activity, ArrowUpRight, CheckCircle2, Clock, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

type GlobalPulseCardProps = {
  stats: PlatformStats;
};

export default function GlobalPulseCard({ stats }: GlobalPulseCardProps) {
  return (
    <Card className="shadow-sm border-zinc-200/60 bg-white/90 backdrop-blur-sm flex flex-col">
      <CardHeader className="border-b border-zinc-100/50 pb-4 bg-zinc-50/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> Global Pulse
        </CardTitle>
        <CardDescription>Real-time entrance overview.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col justify-around">
        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="space-y-1">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Pending at Gates</p>
            <p className="text-4xl font-black text-zinc-900">{stats.pendingVisitors.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-amber-500">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
          <div className="space-y-1">
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest flex items-center gap-1.5"><LogIn className="w-3.5 h-3.5" /> Currently Inside</p>
            <p className="text-4xl font-black text-zinc-900">{stats.insideVisitors.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-2">
          <div className="text-center flex-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Daily Check-ins</p>
            <p className="text-xl font-bold text-zinc-800">{stats.todayVisitors.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-zinc-100 mx-4"></div>
          <div className="text-center flex-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">Avg Daily MRR</p>
            <p className="text-xl font-bold text-zinc-800">KES {Math.round(stats.totalRevenue / 30).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
