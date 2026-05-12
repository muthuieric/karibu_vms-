"use client";

import { ShieldCheck } from "lucide-react";

export default function BillingHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-5 gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Billing & Wallet</h1>
        <p className="text-zinc-500 mt-1.5 text-base">Manage your usage, view outstanding balances, and transaction history.</p>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
        <ShieldCheck className="w-4 h-4" /> Secure SSL Connection
      </div>
    </div>
  );
}
