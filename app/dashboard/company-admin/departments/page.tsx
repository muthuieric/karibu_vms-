"use client";

import AddDepartmentCard from "@/components/dashboard/company-admin/departments/AddDepartmentCard";
import DepartmentsHeader from "@/components/dashboard/company-admin/departments/DepartmentsHeader";
import DepartmentsHostsList from "@/components/dashboard/company-admin/departments/DepartmentsHostsList";
import DepartmentsSearch from "@/components/dashboard/company-admin/departments/DepartmentsSearch";
import { useCompanyDepartments } from "@/hooks/useCompanyDepartments";

export default function DepartmentsPage() {
  const departmentsPage = useCompanyDepartments();

  if (departmentsPage.isLoading) {
    return <div className="p-6 text-center text-text-muted">Loading your workspace...</div>;
  }

  return (
    <div className="min-h-full bg-background p-4 md:p-6 lg:p-8">
      <div className="space-y-8 max-w-6xl mx-auto">
      <DepartmentsHeader />

      <AddDepartmentCard
        newDeptName={departmentsPage.newDeptName}
        onNewDeptNameChange={departmentsPage.setNewDeptName}
        onSubmit={departmentsPage.handleAddDepartment}
      />

      {departmentsPage.departments.length > 0 && (
        <DepartmentsSearch
          searchQuery={departmentsPage.searchQuery}
          onSearchQueryChange={departmentsPage.setSearchQuery}
        />
      )}

      <DepartmentsHostsList
        departmentsCount={departmentsPage.departments.length}
        filteredDepartments={departmentsPage.filteredDepartments}
        searchQuery={departmentsPage.searchQuery}
        selectedDeptId={departmentsPage.selectedDeptId}
        newHost={departmentsPage.newHost}
        editingDeptId={departmentsPage.editingDeptId}
        editingDeptName={departmentsPage.editingDeptName}
        isUpdatingDept={departmentsPage.isUpdatingDept}
        editingHostId={departmentsPage.editingHostId}
        editingHostData={departmentsPage.editingHostData}
        isUpdatingHost={departmentsPage.isUpdatingHost}
        onSelectDept={departmentsPage.setSelectedDeptId}
        onNewHostChange={departmentsPage.setNewHost}
        onAddHost={departmentsPage.handleAddHost}
        onEditDeptStart={(id, name) => {
          departmentsPage.setEditingDeptId(id);
          departmentsPage.setEditingDeptName(name);
        }}
        onEditingDeptNameChange={departmentsPage.setEditingDeptName}
        onUpdateDepartment={departmentsPage.handleUpdateDepartment}
        onCancelEditDepartment={() => departmentsPage.setEditingDeptId(null)}
        onDeleteDepartment={departmentsPage.handleDeleteDepartment}
        onEditHostStart={(host) => {
          departmentsPage.setEditingHostId(host.id);
          departmentsPage.setEditingHostData({ name: host.name, phone: host.phone || "", email: host.email || "" });
        }}
        onEditingHostDataChange={departmentsPage.setEditingHostData}
        onUpdateHost={departmentsPage.handleUpdateHost}
        onCancelEditHost={() => departmentsPage.setEditingHostId(null)}
        onDeleteHost={departmentsPage.handleDeleteHost}
        onClearSearch={() => departmentsPage.setSearchQuery("")}
      />
      </div>
    </div>
  );
}
