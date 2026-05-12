"use client";

import { Loader2 } from "lucide-react";

export default function SuperadminOverviewLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-zinc-500">
      <Loader2 className="w-12 h-12 animate-spin mb-4 text-amber-500" />
      <p className="font-bold text-xl text-zinc-900">Synchronizing Global Data...</p>
      <p className="text-sm mt-1 text-zinc-500">Connecting to secure ledgers and active gates.</p>
    </div>
  );
}
