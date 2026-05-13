"use client";

import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuardsPageHeaderProps = {
  onAddGuard: () => void;
  isAddGuardDisabled?: boolean;
};

export default function GuardsPageHeader({ onAddGuard, isAddGuardDisabled }: GuardsPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-zinc-200 pb-4 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-zinc-200 text-zinc-900 rounded-lg shrink-0">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Security Team</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage gates and guard access accounts.</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Button 
          onClick={onAddGuard} 
          disabled={isAddGuardDisabled}
          className="bg-zinc-900 hover:bg-zinc-800 text-white w-full sm:w-auto h-11 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Guard
        </Button>
        {isAddGuardDisabled && (
          <p className="text-red-500 text-xs">
            Basic plan is limited to 1 guard. Upgrade to Premium for unlimited guards.
          </p>
        )}
      </div>
    </div>
  );
}
