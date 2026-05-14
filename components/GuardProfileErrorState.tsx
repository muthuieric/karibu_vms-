"use client";

import { AlertCircle } from "lucide-react";

export default function GuardProfileErrorState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Error</h2>
        <p className="text-slate-500">
          Could not load your guard profile. Please ensure you are logged in correctly and assigned to an active gate.
        </p>
      </div>
    </div>
  );
}
