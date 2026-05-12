"use client";

import { Loader2 } from "lucide-react";

export default function GateLoadingState() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-zinc-500 font-medium">Loading building rules...</p>
      </div>
    </div>
  );
}
