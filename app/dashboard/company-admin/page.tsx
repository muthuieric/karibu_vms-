"use client";

import { useState } from "react";
import { Download, ScanLine, UserPlus } from "lucide-react";
import Link from "next/link";
import AdminDashboardHeader from "@/components/dashboard/company-admin/AdminDashboardHeader";
import AdminPhotoLightbox from "@/components/dashboard/company-admin/AdminPhotoLightbox";
import AdminStatsGrid from "@/components/dashboard/company-admin/AdminStatsGrid";
import AdminVisitInfoModal from "@/components/dashboard/company-admin/AdminVisitInfoModal";
import MasterVisitorLog from "@/components/dashboard/company-admin/MasterVisitorLog";
import { ActionCard } from "@/components/dashboard/shared/ActionCard";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { Button } from "@/components/ui/button";
import { AdminVisitor, useCompanyAdminDashboard } from "@/hooks/useCompanyAdminDashboard";

export default function AdminDashboard() {
  const dashboard = useCompanyAdminDashboard();
  const [infoModalVisitor, setInfoModalVisitor] = useState<AdminVisitor | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null); 

  const displayedInfoModalVisitor = infoModalVisitor
    ? dashboard.visitors.find((visitor) => visitor.id === infoModalVisitor.id) ?? infoModalVisitor
    : null;

  // --- HARD RENDER BLOCK ---
  if (dashboard.isLocked) {
    return null;
  }

  return (
    <PageContainer>
        <AdminDashboardHeader
          hasActiveFilters={dashboard.hasActiveFilters}
          onDownloadCSV={dashboard.downloadCSV}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <ActionCard
            title="Open gate QR center"
            description="Print visitor check-in and checkout posters for reception points."
            icon={ScanLine}
            action={<Button asChild variant="secondary" className="bg-white/95 text-primary hover:bg-white"><Link href="/dashboard/company-admin/qr">Manage QR codes</Link></Button>}
          />
          <ActionCard
            title="Review pending entries"
            description={`${dashboard.pendingCount} visitor${dashboard.pendingCount === 1 ? "" : "s"} awaiting guard approval right now.`}
            icon={UserPlus}
            tone="warning"
            action={<Button onClick={() => dashboard.setStatusFilter("pending")} variant="secondary" className="bg-white/95 text-orange-700 hover:bg-white">Filter pending</Button>}
          />
          <ActionCard
            title="Export audit trail"
            description="Download a CSV report for audits, reconciliation, or management review."
            icon={Download}
            tone="dark"
            action={<Button onClick={dashboard.downloadCSV} variant="secondary" className="bg-white text-slate-950 hover:bg-white/90">Download report</Button>}
          />
        </div>
        
        <AdminStatsGrid
          totalToday={dashboard.totalToday}
          currentlyInside={dashboard.currentlyInside}
          pendingCount={dashboard.pendingCount}
          lifetimeVisitors={dashboard.lifetimeVisitors}
        />

        <MasterVisitorLog
          loading={dashboard.loading}
          visitors={dashboard.filteredVisitors}
          gates={dashboard.gates}
          searchQuery={dashboard.searchQuery}
          statusFilter={dashboard.statusFilter}
          gateFilter={dashboard.gateFilter}
          startDate={dashboard.startDate}
          endDate={dashboard.endDate}
          hasActiveFilters={dashboard.hasActiveFilters}
          getGateName={dashboard.getGateName}
          onSearchQueryChange={dashboard.setSearchQuery}
          onStatusFilterChange={dashboard.setStatusFilter}
          onGateFilterChange={dashboard.setGateFilter}
          onStartDateChange={dashboard.setStartDate}
          onEndDateChange={dashboard.setEndDate}
          onPhotoClick={setEnlargedPhoto}
          onInfoClick={setInfoModalVisitor}
        />

      {displayedInfoModalVisitor && (
        <AdminVisitInfoModal
          visitor={displayedInfoModalVisitor}
          customFieldLabels={dashboard.customFieldLabels}
          onClose={() => setInfoModalVisitor(null)}
        />
      )}

      {enlargedPhoto && (
        <AdminPhotoLightbox
          photoUrl={enlargedPhoto}
          onClose={() => setEnlargedPhoto(null)}
        />
      )}
    </PageContainer>
  );
}
