"use client";

import { Download, LayoutDashboard } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Button } from "@/components/ui/button";

type AdminDashboardHeaderProps = {
  hasActiveFilters: boolean;
  onDownloadCSV: () => void;
};

export default function AdminDashboardHeader({ hasActiveFilters, onDownloadCSV }: AdminDashboardHeaderProps) {
  return (
    <PageHeader
      title="Building Overview"
      eyebrow="Company admin"
      description="Your live command center for visitor traffic, approvals, gate activity, and audit history."
      icon={LayoutDashboard}
    >
      <Button onClick={onDownloadCSV} className="w-full sm:w-auto">
        <Download className="h-4 w-4" />
        Download {hasActiveFilters ? "Filtered" : "CSV"} Report
      </Button>
    </PageHeader>
  );
}
