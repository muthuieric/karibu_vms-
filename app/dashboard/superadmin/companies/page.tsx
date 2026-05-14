"use client";

import { useState } from "react";
import AddCompanyModal from "@/components/dashboard/superadmin/companies/AddCompanyModal";
import CompaniesDirectoryCard from "@/components/dashboard/superadmin/companies/CompaniesDirectoryCard";
import CompanyVisitorStatsModal from "@/components/dashboard/superadmin/companies/CompanyVisitorStatsModal";
import CreateCompanyAdminModal from "@/components/dashboard/superadmin/companies/CreateCompanyAdminModal";
import SuperadminCompaniesHeader from "@/components/dashboard/superadmin/companies/SuperadminCompaniesHeader";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { useSuperadminCompanies } from "@/hooks/useSuperadminCompanies";

export default function ManageCompaniesPage() {
  const companiesPage = useSuperadminCompanies();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showVisitorsModal, setShowVisitorsModal] = useState(false);

  return (
    <PageContainer>
      <SuperadminCompaniesHeader onNewCompany={() => setShowAddModal(true)} />

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
        onToggleCompanyLock={companiesPage.toggleCompanyLock}
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
    </PageContainer>
  );
}
