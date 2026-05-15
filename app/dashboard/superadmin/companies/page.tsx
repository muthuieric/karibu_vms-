"use client";

import { useState } from "react";
import { Activity, Building2, Lock, PlusCircle, Unlock } from "lucide-react";

import AddCompanyModal from "@/components/dashboard/superadmin/companies/AddCompanyModal";
import CompaniesDirectoryCard from "@/components/dashboard/superadmin/companies/CompaniesDirectoryCard";
import CompanyVisitorStatsModal from "@/components/dashboard/superadmin/companies/CompanyVisitorStatsModal";
import CreateCompanyAdminModal from "@/components/dashboard/superadmin/companies/CreateCompanyAdminModal";
import SuperadminCompaniesHeader from "@/components/dashboard/superadmin/companies/SuperadminCompaniesHeader";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { ModalShell } from "@/components/dashboard/shared/ModalShell";
import { StatCard } from "@/components/dashboard/shared/StatCard";
import { Button } from "@/components/ui/button";
import { useSuperadminCompanies } from "@/hooks/useSuperadminCompanies";

const RECENT_WORKSPACE_CUTOFF = Date.now() - 7 * 24 * 60 * 60 * 1000;

export default function ManageCompaniesPage() {
  const companiesPage = useSuperadminCompanies();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showVisitorsModal, setShowVisitorsModal] = useState(false);
  const [lockTarget, setLockTarget] = useState<{ companyId: string; isLocked: boolean } | null>(null);

  const activeWorkspaces = companiesPage.companies.filter(
    (company) => !company.is_locked && company.subscription_status !== "pending_approval"
  ).length;
  const lockedWorkspaces = companiesPage.companies.filter((company) => company.is_locked).length;
  const recentWorkspaces = companiesPage.companies.filter((company) => {
    const createdAt = new Date(company.created_at).getTime();
    return createdAt >= RECENT_WORKSPACE_CUTOFF;
  }).length;

  return (
    <PageContainer>
      <SuperadminCompaniesHeader onNewCompany={() => setShowAddModal(true)} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total workspaces" value={companiesPage.companies.length.toLocaleString()} description="All registered client spaces" icon={Building2} tone="primary" />
        <StatCard label="Active workspaces" value={activeWorkspaces.toLocaleString()} description="Unlocked and operating" icon={Unlock} tone="success" />
        <StatCard label="Locked workspaces" value={lockedWorkspaces.toLocaleString()} description="Access currently restricted" icon={Lock} tone={lockedWorkspaces > 0 ? "danger" : "neutral"} />
        <StatCard label="Recent activity" value={recentWorkspaces.toLocaleString()} description="New workspaces this week" icon={Activity} tone="warning" />
      </div>

      <CompaniesDirectoryCard
        companies={companiesPage.companies}
        filteredCompanies={companiesPage.filteredCompanies}
        loading={companiesPage.loading}
        searchTerm={companiesPage.searchTerm}
        onSearchTermChange={companiesPage.setSearchTerm}
        onOpenAdminModal={(companyId) => {
          companiesPage.openAdminForm(companyId);
          setShowAdminModal(true);
        }}
        onViewCompanyVisitors={(companyId, companyName) => {
          setShowVisitorsModal(true);
          companiesPage.viewCompanyVisitors(companyId, companyName);
        }}
        onToggleCompanyLock={(companyId, currentLockStatus) => setLockTarget({ companyId, isLocked: currentLockStatus })}
        onApproveCompany={companiesPage.approveCompany}
        onChangePlanTier={companiesPage.handleChangePlanTier}
      />

      {showAddModal && (
        <AddCompanyModal
          newCompanyName={companiesPage.newCompanyName}
          planType={companiesPage.planType}
          isSubmitting={companiesPage.isSubmitting}
          onClose={() => setShowAddModal(false)}
          onSubmit={(event) => companiesPage.handleCreateCompany(event, () => setShowAddModal(false))}
          onNewCompanyNameChange={companiesPage.setNewCompanyName}
          onPlanTypeChange={companiesPage.setPlanType}
        />
      )}

      {showAdminModal && (
        <CreateCompanyAdminModal
          adminForm={companiesPage.adminForm}
          isCreatingAdmin={companiesPage.isCreatingAdmin}
          onClose={() => setShowAdminModal(false)}
          onSubmit={(event) => companiesPage.handleCreateAdmin(event, () => setShowAdminModal(false))}
          onAdminFormChange={companiesPage.setAdminForm}
        />
      )}

      {showVisitorsModal && (
        <CompanyVisitorStatsModal
          companyName={companiesPage.viewingCompanyName}
          visitorStats={companiesPage.visitorStats}
          loadingVisitors={companiesPage.loadingVisitors}
          onClose={() => setShowVisitorsModal(false)}
        />
      )}

      {lockTarget && (
        <ModalShell
          title={lockTarget.isLocked ? "Unlock workspace?" : "Lock workspace?"}
          description={
            lockTarget.isLocked
              ? "This will restore dashboard access for the selected workspace."
              : "This will restrict dashboard access for the selected workspace."
          }
          onClose={() => setLockTarget(null)}
          footer={
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setLockTarget(null)}>Cancel</Button>
              <Button
                type="button"
                variant={lockTarget.isLocked ? "default" : "destructive"}
                onClick={() => {
                  companiesPage.toggleCompanyLock(lockTarget.companyId, lockTarget.isLocked, true);
                  setLockTarget(null);
                }}
              >
                {lockTarget.isLocked ? <><PlusCircle className="h-4 w-4" /> Unlock Workspace</> : <><Lock className="h-4 w-4" /> Lock Workspace</>}
              </Button>
            </div>
          }
        >
          <p className="text-sm leading-6 text-slate-500">
            The workspace record, billing data, and visitor history will remain unchanged.
          </p>
        </ModalShell>
      )}
    </PageContainer>
  );
}
