"use client";

import { useState } from "react";
import AdminDashboardHeader from "@/components/dashboard/company-admin/AdminDashboardHeader";
import AdminPhotoLightbox from "@/components/dashboard/company-admin/AdminPhotoLightbox";
import AdminStatsGrid from "@/components/dashboard/company-admin/AdminStatsGrid";
import AdminVisitInfoModal from "@/components/dashboard/company-admin/AdminVisitInfoModal";
import MasterVisitorLog from "@/components/dashboard/company-admin/MasterVisitorLog";
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
    <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <AdminDashboardHeader
          hasActiveFilters={dashboard.hasActiveFilters}
          onDownloadCSV={dashboard.downloadCSV}
        />
        
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
      </div>

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
    </div>
  );
}
