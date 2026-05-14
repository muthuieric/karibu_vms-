"use client";

import { Download, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminDashboardHeaderProps = {
  hasActiveFilters: boolean;
  onDownloadCSV: () => void;
};

export default function AdminDashboardHeader({ hasActiveFilters, onDownloadCSV }: AdminDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Company Admin</p>
          <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
        </div>
      </div>
      
      <Button onClick={onDownloadCSV} variant="outline" className="w-full sm:w-auto h-11 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-[1rem]">
        <Download className="h-4 w-4 mr-2" />
        Export {hasActiveFilters ? "Filtered" : "CSV"} Report
      </Button>
    </div>
  );
}
