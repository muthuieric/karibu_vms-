"use client";

import { Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuardsPageHeaderProps = {
  onAddGuard: () => void;
};

export default function GuardsPageHeader({ onAddGuard }: GuardsPageHeaderProps) {
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
          className="bg-zinc-900 hover:bg-zinc-800 text-white w-full sm:w-auto h-11 shadow-sm"
        >
          <Plus className="mr-2 h-5 w-5" /> Add New Guard
        </Button>
      </div>
    </div>
  );
}
