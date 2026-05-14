"use client";

import { useState } from "react";
import Link from "next/link";
import AdminDashboardHeader from "@/components/dashboard/company-admin/AdminDashboardHeader";
import AdminPhotoLightbox from "@/components/dashboard/company-admin/AdminPhotoLightbox";
import AdminStatsGrid from "@/components/dashboard/company-admin/AdminStatsGrid";
import AdminVisitInfoModal from "@/components/dashboard/company-admin/AdminVisitInfoModal";
import MasterVisitorLog from "@/components/dashboard/company-admin/MasterVisitorLog";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
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
        <AdminDashboardHeader
          hasActiveFilters={dashboard.hasActiveFilters}
          onDownloadCSV={dashboard.downloadCSV}
        />

        <section className="grid gap-4">
          <div className="rounded-[1.6rem] border border-blue-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge className="border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 uppercase tracking-wider font-bold">Workspace</Badge>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Building Overview</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Manage visitors, view real-time gate activity, and monitor entry approvals across the organization.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <Button asChild className="bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-sm rounded-[1rem] h-11 px-6">
                  <Link href="/dashboard/company-admin/qr">Manage Gate QR</Link>
                </Button>
                {dashboard.pendingCount > 0 && (
                  <Button onClick={() => dashboard.setStatusFilter("pending")} variant="outline" className="border-orange-200 bg-orange-50 font-bold text-orange-700 hover:bg-orange-100 rounded-[1rem] h-11 px-6">
                    Review {dashboard.pendingCount} Pending
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
        
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
