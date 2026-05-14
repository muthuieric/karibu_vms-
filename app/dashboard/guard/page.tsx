"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Visitor } from "@/types/guard";
import { useGuardDashboard } from "@/hooks/useGuardDashboard";

import GuardDashboardHeader from "@/components/GuardDashboardHeader";
import GuardProfileErrorState from "@/components/GuardProfileErrorState";
import GuardStats from "@/components/GuardStats";
import GuardVisitorsTable from "@/components/GuardVisitorsTable";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const AddVisitorModal = dynamic(() => import("@/components/dashboard/guard/add-visitor/AddVisitorModal"), { ssr: false });
const GuardQrModal = dynamic(() => import("@/components/dashboard/guard/GuardQrModal"), { ssr: false });
const VisitInfoModal = dynamic(() => import("@/components/dashboard/guard/VisitInfoModal"), { ssr: false });
const PhotoLightbox = dynamic(() => import("@/components/dashboard/guard/PhotoLightbox"), { ssr: false });

export default function GuardDashboard() {
  const dashboard = useGuardDashboard();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [infoModalVisitor, setInfoModalVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    if (!showQrModal) return undefined;

    const interval = setInterval(() => {
      dashboard.tickQrTimestamp();
    }, 300000);

    return () => clearInterval(interval);
  }, [dashboard, showQrModal]);

  const displayedInfoModalVisitor = infoModalVisitor
    ? dashboard.visitors.find((visitor) => visitor.id === infoModalVisitor.id) ?? infoModalVisitor
    : null;

  if (!dashboard.companyId && !dashboard.loading) {
    return <GuardProfileErrorState />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageContainer className="space-y-6 lg:space-y-8">
        <GuardDashboardHeader
          guardGateName={dashboard.guardGateName}
          onLogout={dashboard.handleLogout}
          onShowQr={() => {
            dashboard.tickQrTimestamp();
            setShowQrModal(true);
          }}
          onShowAddVisitor={() => setShowAddModal(true)}
        />

        <section className="grid gap-4">
          <div className="rounded-[1.6rem] border border-blue-100 bg-white p-6 text-slate-900 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge className="border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100">Live security desk</Badge>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl text-slate-900">{dashboard.guardGateName}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Process arrivals, verify approvals, and move checked-in visitors out quickly from one queue.
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-blue-600">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>
          </div>
        </section>

        {!dashboard.isLocked && (
          <GuardStats
            totalToday={dashboard.totalToday}
            pendingCount={dashboard.pendingCount}
            checkedInCount={dashboard.checkedInCount}
          />
        )}

        <GuardVisitorsTable
          loading={dashboard.loading}
          visitors={dashboard.filteredVisitors}
          searchTerm={dashboard.searchTerm}
          statusFilter={dashboard.statusFilter}
          planTier={dashboard.planTier}
          verifyingId={dashboard.verifyingId}
          sendingOtpId={dashboard.sendingOtpId}
          otpInput={dashboard.otpInput}
          onSearchTermChange={dashboard.setSearchTerm}
          onStatusFilterChange={dashboard.setStatusFilter}
          onPhotoClick={setEnlargedPhoto}
          onInfoClick={setInfoModalVisitor}
          onOtpInputChange={dashboard.setOtpInput}
          onConfirmOTP={dashboard.handleConfirmOTP}
          onCancelOTP={() => dashboard.setVerifyingId(null)}
          onSendOTP={dashboard.handleSendOTP}
          onCheckOut={dashboard.handleCheckOut}
          onDirectApprove={dashboard.handleDirectApprove}
          onManualOverride={dashboard.handleManualOverride}
        />
      <AddVisitorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        companyId={dashboard.companyId}
        requirePhoto={dashboard.requirePhoto}
        askPhone={dashboard.askPhone}
        askId={dashboard.askId}
        askHost={dashboard.askHost}
        askPurpose={dashboard.askPurpose}
        askVehicle={dashboard.askVehicle}
        guardGateId={dashboard.guardGateId}
      />

      <GuardQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        qrUrl={dashboard.getDynamicQrUrl()}
        guardGateName={dashboard.guardGateName}
        handlePrintQr={dashboard.handlePrintQr}
      />
      <VisitInfoModal
        visitor={displayedInfoModalVisitor}
        onClose={() => setInfoModalVisitor(null)}
        customFieldLabels={dashboard.customFieldLabels}
      />
      <PhotoLightbox photoUrl={enlargedPhoto} onClose={() => setEnlargedPhoto(null)} />
      </PageContainer>
    </div>
  );
}
