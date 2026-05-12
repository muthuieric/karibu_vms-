"use client";

import { BarChart3 } from "lucide-react";

export default function SuperadminOverviewHeader() {
  return (
    <div className="border-b border-zinc-200 pb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 text-amber-700 rounded-lg shrink-0">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Platform Pulse</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Real-time global analytics for your VMS network.</p>
        </div>
      </div>
    </div>
  );
}
