"use client";

import { useState } from "react";
import AddGuardModal from "@/components/dashboard/guards/AddGuardModal";
import EditGuardModal from "@/components/dashboard/guards/EditGuardModal";
import GatesManagementCard from "@/components/dashboard/guards/GatesManagementCard";
import GuardsAccountsCard from "@/components/dashboard/guards/GuardsAccountsCard";
import GuardsPageHeader from "@/components/dashboard/guards/GuardsPageHeader";
import GuardsProfileError from "@/components/dashboard/guards/GuardsProfileError";
import { GuardProfile, useCompanyAdminGuards } from "@/hooks/useCompanyAdminGuards";

export default function ManageGuards() {
  const guardsPage = useCompanyAdminGuards();
  const [showModal, setShowModal] = useState(false);
  const [showEditGuardModal, setShowEditGuardModal] = useState(false);

  const openEditGuardModal = (guard: GuardProfile) => {
    guardsPage.startEditGuard(guard);
    setShowEditGuardModal(true);
  };

  if (!guardsPage.companyId && !guardsPage.loading) {
    return <GuardsProfileError />;
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        <GuardsPageHeader onAddGuard={() => setShowModal(true)} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GatesManagementCard
            gates={guardsPage.gates}
            newGateName={guardsPage.newGateName}
            isCreatingGate={guardsPage.isCreatingGate}
            editingGateId={guardsPage.editingGateId}
            editingGateName={guardsPage.editingGateName}
            isUpdatingGate={guardsPage.isUpdatingGate}
            onNewGateNameChange={guardsPage.setNewGateName}
            onCreateGate={guardsPage.handleCreateGate}
            onEditGateStart={(gate) => {
              guardsPage.setEditingGateId(gate.id);
              guardsPage.setEditingGateName(gate.name);
            }}
            onEditingGateNameChange={guardsPage.setEditingGateName}
            onUpdateGate={guardsPage.handleUpdateGate}
            onCancelEditGate={() => guardsPage.setEditingGateId(null)}
            onDeleteGate={guardsPage.handleDeleteGate}
          />

          <GuardsAccountsCard
            loading={guardsPage.loading}
            guards={guardsPage.guards}
            getGateName={guardsPage.getGateName}
            onEditGuard={openEditGuardModal}
            onDeleteGuard={guardsPage.handleDeleteGuard}
          />
        </div>
      </div>

      {showModal && (
        <AddGuardModal
          gates={guardsPage.gates}
          newGuard={guardsPage.newGuard}
          isSubmitting={guardsPage.isSubmitting}
          onClose={() => setShowModal(false)}
          onSubmit={(event) => guardsPage.handleCreateGuard(event, () => setShowModal(false))}
          onNewGuardChange={guardsPage.setNewGuard}
        />
      )}

      {showEditGuardModal && (
        <EditGuardModal
          gates={guardsPage.gates}
          editingGuardData={guardsPage.editingGuardData}
          isEditingGuard={guardsPage.isEditingGuard}
          onClose={() => setShowEditGuardModal(false)}
          onSubmit={(event) => guardsPage.handleUpdateGuard(event, () => setShowEditGuardModal(false))}
          onEditingGuardDataChange={guardsPage.setEditingGuardData}
        />
      )}
    </div>
  );
}
