"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminDashboardHeaderProps = {
  hasActiveFilters: boolean;
  onDownloadCSV: () => void;
};

export default function AdminDashboardHeader({ hasActiveFilters, onDownloadCSV }: AdminDashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-zinc-200 pb-4 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Building Overview</h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">Global analytics and visitor history.</p>
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <Button variant="default" onClick={onDownloadCSV} className="shadow-sm bg-zinc-900 hover:bg-zinc-800 text-white w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Download {hasActiveFilters ? "Filtered" : "CSV"} Report
        </Button>
      </div>
    </div>
  );
}
