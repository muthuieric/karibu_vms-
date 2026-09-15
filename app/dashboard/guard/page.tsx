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
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, RefreshCw, ScanQrCode, ShieldCheck, UserPlus2, Wifi, WifiOff, X } from "lucide-react";

const AddVisitorModal = dynamic(() => import("@/components/dashboard/guard/add-visitor/AddVisitorModal"), { ssr: false });
const GuardAccessNoteModal = dynamic(() => import("@/components/dashboard/guard/GuardAccessNoteModal"), { ssr: false });
const GuardQrModal = dynamic(() => import("@/components/dashboard/guard/GuardQrModal"), { ssr: false });
const VisitInfoModal = dynamic(() => import("@/components/dashboard/guard/VisitInfoModal"), { ssr: false });
const PhotoLightbox = dynamic(() => import("@/components/dashboard/guard/PhotoLightbox"), { ssr: false });

export default function GuardDashboard() {
  const dashboard = useGuardDashboard();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [infoModalVisitor, setInfoModalVisitor] = useState<Visitor | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<{ visitorName: string; time: string } | null>(null);

  const handleConfirmPreRegistered = async (visitor: Visitor) => {
    const result = await dashboard.handleConfirmPreRegistered(visitor);
    if (result && result.success) {
      const timeString = result.checkedInAt
        ? new Date(result.checkedInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setConfirmSuccess({
        visitorName: visitor.name,
        time: timeString,
      });
      setTimeout(() => {
        setConfirmSuccess((current) => (current?.visitorName === visitor.name ? null : current));
      }, 7000);
    }
  };

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
    if (dashboard.accessError === "session_expired") {
      return (
        <GuardProfileErrorState
          title="Session expired"
          message="Please sign in again to continue managing visitors."
        />
      );
    }

    return <GuardProfileErrorState />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <PageContainer className="space-y-6 lg:space-y-8">
        <GuardDashboardHeader
          guardGateName={dashboard.guardGateName}
          companyName={dashboard.companyName}
          companyLogoUrl={dashboard.companyLogoUrl}
          onLogout={dashboard.handleLogout}
          onShowIncidentReport={() => setShowIncidentModal(true)}
        />

        <section className="grid gap-4">
          <div className="rounded-[1.6rem] border border-blue-100 bg-white p-6 text-slate-900 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100">Live security desk</Badge>
                  {!dashboard.isOnline ? (
                    <Badge className="border-amber-300 bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                      <WifiOff className="h-3 w-3 text-amber-700" /> Working Offline
                    </Badge>
                  ) : dashboard.pendingSyncCount > 0 ? (
                    <Badge className="border-blue-300 bg-blue-100 text-blue-900 font-semibold flex items-center gap-1">
                      <RefreshCw className={`h-3 w-3 text-blue-700 ${dashboard.isSyncing ? "animate-spin" : ""}`} />
                      {dashboard.pendingSyncCount} to sync
                    </Badge>
                  ) : (
                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800 font-medium flex items-center gap-1">
                      <Wifi className="h-3 w-3 text-emerald-600" /> Online
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dashboard.syncNow()}
                    disabled={dashboard.isSyncing}
                    title="Sync and refresh local cache"
                    className="h-7 px-2.5 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white shadow-xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${dashboard.isSyncing ? "animate-spin text-blue-600" : "text-slate-600"}`} />
                    <span>{dashboard.isSyncing ? "Syncing..." : "Sync Now"}</span>
                  </Button>

                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <span>Last Synced:</span>
                    <span className="font-semibold text-slate-700">
                      {dashboard.lastSynced
                        ? dashboard.lastSynced.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                        : "Just now"}
                    </span>
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl text-slate-900">{dashboard.guardGateName}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                  Process arrivals, verify approvals, and move checked-in visitors out quickly from one queue.
                </p>
              </div>
              <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end lg:max-w-md">
                <Button
                  variant="outline"
                  onClick={dashboard.refreshCompanySettings}
                  className="h-11 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    dashboard.tickQrTimestamp();
                    setShowQrModal(true);
                  }}
                  className="h-11 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                >
                  <ScanQrCode className="mr-2 h-4 w-4" />
                  Show QR
                </Button>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="h-11 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                >
                  <UserPlus2 className="mr-2 h-4 w-4" />
                  New Visitor
                </Button>
                {/* <div className="hidden rounded-2xl border border-blue-100 bg-blue-50 p-3 text-blue-600 lg:flex">
                  <ShieldCheck className="h-7 w-7" />
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {!dashboard.isOnline && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <WifiOff className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Working Offline (Local Mode)
                </p>
                <p className="text-xs text-amber-700">
                  Internet connection lost. You can continue registering and checking in visitors. Changes are saved locally and will sync automatically once reconnected.
                  {dashboard.pendingSyncCount > 0 && ` (${dashboard.pendingSyncCount} action${dashboard.pendingSyncCount > 1 ? "s" : ""} queued)`}
                </p>
              </div>
            </div>
            <Badge className="border-amber-300 bg-amber-200 text-amber-900 text-xs font-semibold shrink-0">
              Offline Storage Active
            </Badge>
          </div>
        )}

        {dashboard.isOnline && dashboard.pendingSyncCount > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                <RefreshCw className={`h-5 w-5 ${dashboard.isSyncing ? "animate-spin" : ""}`} />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Syncing Local Changes ({dashboard.pendingSyncCount} action{dashboard.pendingSyncCount > 1 ? "s" : ""} queued)
                </p>
                <p className="text-xs text-blue-700">
                  Back online. Uploading offline check-ins and registrations to the central server...
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={dashboard.syncPendingOfflineQueue}
              disabled={dashboard.isSyncing}
              className="border-blue-300 bg-white text-blue-700 hover:bg-blue-100 font-semibold shrink-0"
            >
              {dashboard.isSyncing ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        )}

        {dashboard.failedSyncCount > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-100 p-2 text-rose-600 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Some offline actions failed to sync.
                </p>
                <p className="text-xs text-rose-700">
                  {dashboard.failedSyncCount} action{dashboard.failedSyncCount > 1 ? "s" : ""} could not be processed by the server. Clear them to remove this warning.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={dashboard.clearFailedSyncs}
              className="border-rose-300 bg-white text-rose-700 hover:bg-rose-100 font-semibold shrink-0"
            >
              Clear Failed Actions
            </Button>
          </div>
        )}

        {!dashboard.isLocked && (
          <GuardStats
            totalToday={dashboard.totalToday}
            pendingCount={dashboard.pendingCount}
            checkedInCount={dashboard.checkedInCount}
            preRegisteredCount={dashboard.preRegisteredCount}
          />
        )}

        {confirmSuccess && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Entry Confirmed: <span className="font-extrabold">{confirmSuccess.visitorName}</span>
                </p>
                <p className="text-xs text-emerald-700">
                  Checked in at {confirmSuccess.time}. Host arrival SMS notification dispatched.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmSuccess(null)}
              className="h-8 w-8 p-0 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {dashboard.qrPassSetupWarning && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
            {dashboard.qrPassSetupWarning}
          </div>
        )}

        <GuardVisitorsTable
          loading={dashboard.loading}
          visitors={dashboard.filteredVisitors}
          searchTerm={dashboard.searchTerm}
          statusFilter={dashboard.statusFilter}
          planTier={dashboard.planTier}
          verificationMethod={dashboard.verificationMethod}
          qrPassSetupWarning={dashboard.qrPassSetupWarning}
          qrPassEnabled={!dashboard.qrPassSetupWarning}
          verifyingId={dashboard.verifyingId}
          sendingOtpId={dashboard.sendingOtpId}
          approvingPassId={dashboard.approvingPassId}
          confirmingPreRegisteredId={dashboard.confirmingPreRegisteredId}
          preRegisteredCount={dashboard.preRegisteredCount}
          otpInput={dashboard.otpInput}
          onSearchTermChange={dashboard.setSearchTerm}
          onStatusFilterChange={dashboard.setStatusFilter}
          onPhotoClick={setEnlargedPhoto}
          onInfoClick={setInfoModalVisitor}
          onOtpInputChange={dashboard.setOtpInput}
          onConfirmOTP={dashboard.handleConfirmOTP}
          onCancelOTP={() => dashboard.setVerifyingId(null)}
          onSendOTP={dashboard.handleSendOTP}
          onApprovePass={dashboard.handleApprovePass}
          onCheckOut={dashboard.handleCheckOut}
          onDirectApprove={dashboard.handleDirectApprove}
          onConfirmPreRegistered={handleConfirmPreRegistered}
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
        verificationMethod={dashboard.verificationMethod}
        qrPassEnabled={!dashboard.qrPassSetupWarning}
        onVisitorAdded={dashboard.addVisitorToQueue}
      />

      <GuardQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        qrUrl={dashboard.getDynamicQrUrl()}
        guardGateName={dashboard.guardGateName}
        handlePrintQr={dashboard.handlePrintQr}
      />
      <GuardAccessNoteModal
        open={showIncidentModal}
        visitors={dashboard.visitors}
        gateId={dashboard.guardGateId}
        onClose={() => setShowIncidentModal(false)}
        onSaved={dashboard.refreshCompanySettings}
      />
      <VisitInfoModal
        visitor={displayedInfoModalVisitor}
        onClose={() => setInfoModalVisitor(null)}
        customFieldLabels={dashboard.customFieldLabels}
        planTier={dashboard.planTier}
      />
      <PhotoLightbox photoUrl={enlargedPhoto} onClose={() => setEnlargedPhoto(null)} />
      </PageContainer>
    </div>
  );
}
