"use client";

import { Clock, History, ShieldCheck, Users } from "lucide-react";

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Today</p>
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">{totalToday}</div>
      </div>

      <div className="rounded-[1.4rem] border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Inside Now</p>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">{currentlyInside}</div>
      </div>

      <div className="rounded-[1.4rem] border border-orange-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Waiting Review</p>
          <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">{pendingCount}</div>
      </div>

      <div className="rounded-[1.4rem] border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">All-Time</p>
          <div className="rounded-xl bg-slate-50 p-2 text-slate-600">
            <History className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">{lifetimeVisitors.toLocaleString()}</div>
      </div>
    </div>
  );
}
