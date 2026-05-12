"use client";

import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type SuperadminCompaniesHeaderProps = {
  onNewCompany: () => void;
};

export default function SuperadminCompaniesHeader({ onNewCompany }: SuperadminCompaniesHeaderProps) {
  return (
    <div className="border-b border-zinc-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Client Companies</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Manage organizations registered on your platform.</p>
        </div>
      </div>
      <Button onClick={onNewCompany} className="bg-zinc-900 hover:bg-zinc-800 text-white w-full sm:w-auto shadow-sm">
        <Plus className="mr-2 h-4 w-4" /> New Company
      </Button>
    </div>
  );
}
