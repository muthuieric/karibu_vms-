"use client";

import { useState } from "react";
import AdminPhotoLightbox from "@/components/dashboard/company-admin/AdminPhotoLightbox";
import AdminStatsGrid from "@/components/dashboard/company-admin/AdminStatsGrid";
import AdminVisitInfoModal from "@/components/dashboard/company-admin/AdminVisitInfoModal";
import MasterVisitorLog from "@/components/dashboard/company-admin/MasterVisitorLog";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Download } from "lucide-react";
import { AdminVisitor, useCompanyAdminDashboard } from "@/hooks/useCompanyAdminDashboard";

export default function AdminDashboard() {
  const dashboard = useCompanyAdminDashboard();
  const [infoModalVisitor, setInfoModalVisitor] = useState<AdminVisitor | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null); 

  const displayedInfoModalVisitor = infoModalVisitor
    ? dashboard.visitors.find((visitor) => visitor.id === infoModalVisitor.id) ?? infoModalVisitor
    : null;

  if (dashboard.isLocked) {
    return null;
  }

  return (
    <PageContainer>
        <PageHeader
          title="Admin Home"
          eyebrow="Company Admin"
          description="Manage visitors, view real-time gate activity, and monitor entry approvals across the organization."
          icon={LayoutDashboard}
        >
          <div className="flex flex-col gap-3 sm:flex-row shrink-0 w-full sm:w-auto">
            <Button onClick={dashboard.downloadCSV} variant="outline" className="w-full sm:w-auto bg-white border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl h-11">
              <Download className="h-4 w-4 mr-2" />
              Export Records
            </Button>
            {dashboard.pendingCount > 0 && (
              <Button onClick={() => dashboard.setStatusFilter("pending")} className="w-full sm:w-auto bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 font-bold rounded-xl h-11 px-6">
                Waiting Review ({dashboard.pendingCount})
              </Button>
            )}
          </div>
        </PageHeader>
        
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
