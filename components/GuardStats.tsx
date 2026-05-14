"use client";

import { CheckCircle2, Clock, Users } from "lucide-react";

type GuardStatsProps = {
  totalToday: number;
  pendingCount: number;
  checkedInCount: number;
};

export default function GuardStats({ totalToday, pendingCount, checkedInCount }: GuardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Today&apos;s Visitors</p>
          <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">{totalToday}</div>
      </div>

      <div className="rounded-[1.4rem] border border-orange-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Pending Review</p>
          <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">{pendingCount}</div>
      </div>

      <div className="rounded-[1.4rem] border border-emerald-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Checked In</p>
          <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-black text-slate-900">{checkedInCount}</div>
      </div>
    </div>
  );
}
