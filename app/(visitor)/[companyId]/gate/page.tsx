"use client";

import GateExpiredState from "@/components/GateExpiredState";
import GateGeofenceErrorState from "@/components/GateGeofenceErrorState";
import PublicGatePageShell from "@/components/PublicGatePageShell";
import GateAccessDeniedState from "@/components/visitor/gate/GateAccessDeniedState";
import GateLoadingState from "@/components/visitor/gate/GateLoadingState";
import GateSuccessState from "@/components/visitor/gate/GateSuccessState";
import VisitorCheckInForm from "@/components/visitor/gate/VisitorCheckInForm";
import { usePublicGateCheckIn } from "@/hooks/usePublicGateCheckIn";
import "react-phone-input-2/lib/style.css";

function CheckInFormContent() {
  const gate = usePublicGateCheckIn();

  if (gate.loading) {
    return <GateLoadingState />;
  }

  if (gate.isQrExpired) {
    return <GateExpiredState />;
  }

  if (gate.geofenceError) {
    return (
      <GateGeofenceErrorState
        message={gate.geofenceError}
        debugDetails={gate.geofenceDebugDetails}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (gate.accessDenied) {
    return <GateAccessDeniedState />;
  }

  if (gate.submitted) {
    return <GateSuccessState />;
  }

  return (
    <VisitorCheckInForm
      companyName={gate.companyName}
      gateName={gate.gateName}
      rules={gate.rules}
      customFields={gate.customFields}
      customAnswers={gate.customAnswers}
      newVisitor={gate.newVisitor}
      hostSearchQuery={gate.hostSearchQuery}
      isHostDropdownOpen={gate.isHostDropdownOpen}
      filteredDepartments={gate.filteredDepartments}
      selfiePreview={gate.selfiePreview}
      isSubmitting={gate.isSubmitting}
      agreedToTerms={gate.agreedToTerms}
      validationErrors={gate.validationErrors}
      selfieInputRef={gate.selfieInputRef}
      dropdownRef={gate.dropdownRef}
      onSubmit={gate.handleSubmit}
      onNewVisitorChange={gate.setNewVisitor}
      onHostSearchQueryChange={gate.setHostSearchQuery}
      onHostDropdownOpenChange={gate.setIsHostDropdownOpen}
      onCustomAnswersChange={gate.setCustomAnswers}
      onSelfieFileChange={gate.setSelfieFile}
      onSelfiePreviewChange={gate.setSelfiePreview}
      onAgreedToTermsChange={gate.setAgreedToTerms}
    />
  );
}

export default function PublicGateCheckInWrapper() {
  return (
    <PublicGatePageShell>
      <CheckInFormContent />
    </PublicGatePageShell>
  );
}
