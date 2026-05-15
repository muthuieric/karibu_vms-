"use client";

import { useState } from "react";
import { ContactRound, DoorOpen, MapPinned } from "lucide-react";
import AddGuardModal from "@/components/dashboard/guards/AddGuardModal";
import EditGuardModal from "@/components/dashboard/guards/EditGuardModal";
import GatesManagementCard from "@/components/dashboard/guards/GatesManagementCard";
import GuardsAccountsCard from "@/components/dashboard/guards/GuardsAccountsCard";
import GuardsPageHeader from "@/components/dashboard/guards/GuardsPageHeader";
import GuardsProfileError from "@/components/dashboard/guards/GuardsProfileError";
import { GuardProfile, useCompanyAdminGuards } from "@/hooks/useCompanyAdminGuards";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SecurityTab = "guards" | "entry-points" | "assignments";

export default function ManageGuards() {
  const guardsPage = useCompanyAdminGuards();
  const [showModal, setShowModal] = useState(false);
  const [showEditGuardModal, setShowEditGuardModal] = useState(false);
  const [activeTab, setActiveTab] = useState<SecurityTab>("guards");

  const openEditGuardModal = (guard: GuardProfile) => {
    guardsPage.startEditGuard(guard);
    setShowEditGuardModal(true);
  };

  if (!guardsPage.companyId && !guardsPage.loading) {
    return <GuardsProfileError />;
  }

  return (
    <PageContainer className="max-w-6xl">
        <GuardsPageHeader onAddGuard={() => setShowModal(true)} />

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Guard accounts", value: guardsPage.guards.length, icon: ContactRound },
            { label: "Entry points", value: guardsPage.gates.length, icon: DoorOpen },
            { label: "Assigned gates", value: guardsPage.guards.filter((guard) => guard.gate_id).length, icon: MapPinned },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-bold text-slate-500">{item.label}</p>
                    <p className="mt-1 text-3xl font-black text-slate-950">{item.value}</p>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-[1.2rem] border border-slate-100 bg-white p-2 shadow-sm">
          {[
            { id: "guards", label: "Guards" },
            { id: "entry-points", label: "Entry points" },
            { id: "assignments", label: "Assignments" },
          ].map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant="ghost"
              onClick={() => setActiveTab(tab.id as SecurityTab)}
              className={`h-10 rounded-xl px-4 font-bold ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-50"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "guards" && (
          <GuardsAccountsCard
            loading={guardsPage.loading}
            guards={guardsPage.guards}
            getGateName={guardsPage.getGateName}
            onEditGuard={openEditGuardModal}
            onDeleteGuard={guardsPage.handleDeleteGuard}
          />
        )}

        {activeTab === "entry-points" && (
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
        )}

        {activeTab === "assignments" && (
          <GuardsAccountsCard
            loading={guardsPage.loading}
            guards={guardsPage.guards}
            getGateName={guardsPage.getGateName}
            onEditGuard={openEditGuardModal}
            onDeleteGuard={guardsPage.handleDeleteGuard}
          />
        )}

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
    </PageContainer>
  );
}
