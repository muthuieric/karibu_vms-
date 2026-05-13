"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Visitor } from "@/types/guard";
import { useGuardDashboard } from "@/hooks/useGuardDashboard";

import GuardDashboardHeader from "@/components/GuardDashboardHeader";
import GuardProfileErrorState from "@/components/GuardProfileErrorState";
import GuardStats from "@/components/GuardStats";
import GuardVisitorsTable from "@/components/GuardVisitorsTable";

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
    <div className="min-h-screen bg-zinc-50 p-6 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-400/20 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <GuardDashboardHeader
          guardGateName={dashboard.guardGateName}
          onLogout={dashboard.handleLogout}
          onShowQr={() => {
            dashboard.tickQrTimestamp();
            setShowQrModal(true);
          }}
          onShowAddVisitor={() => setShowAddModal(true)}
        />

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
      </div>

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
    </div>
  );
}
