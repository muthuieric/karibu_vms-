"use client";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import AddDepartmentCard from "@/components/dashboard/company-admin/departments/AddDepartmentCard";
import DepartmentsHeader from "@/components/dashboard/company-admin/departments/DepartmentsHeader";
import DepartmentsHostsList from "@/components/dashboard/company-admin/departments/DepartmentsHostsList";
import DepartmentsSearch from "@/components/dashboard/company-admin/departments/DepartmentsSearch";
import { useCompanyDepartments } from "@/hooks/useCompanyDepartments";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DepartmentsPage() {
  const departmentsPage = useCompanyDepartments();
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  const handleAddDepartment = (event: React.FormEvent) => {
    departmentsPage.handleAddDepartment(event);
    setShowAddDepartment(false);
  };

  if (departmentsPage.isLoading) {
    return <div className="p-6 text-center text-slate-500 font-bold">Loading your workspace...</div>;
  }

  return (
    <PageContainer className="max-w-6xl space-y-8">
      <DepartmentsHeader onAddDepartment={() => setShowAddDepartment(true)} />

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

      {showAddDepartment && (
        <AddDepartmentCard
          newDeptName={departmentsPage.newDeptName}
          onNewDeptNameChange={departmentsPage.setNewDeptName}
          onSubmit={handleAddDepartment}
          onClose={() => setShowAddDepartment(false)}
        />
      )}

      {departmentsPage.editingDeptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
          <Card className="my-auto w-full max-w-md overflow-hidden rounded-[1.4rem] border-slate-100 bg-white shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Edit Department</CardTitle>
                  <CardDescription className="mt-1">Update the department name shown on check-in forms.</CardDescription>
                </div>
                <Button type="button" variant="ghost" onClick={() => departmentsPage.setEditingDeptId(null)} className="h-9 w-9 shrink-0 rounded-full p-0 text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <form onSubmit={departmentsPage.handleUpdateDepartment} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-department-name" className="font-bold text-slate-700">Department Name</Label>
                  <Input
                    id="edit-department-name"
                    value={departmentsPage.editingDeptName}
                    onChange={(event) => departmentsPage.setEditingDeptName(event.target.value)}
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600"
                    autoFocus
                  />
                </div>
                <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
                  <Button type="button" variant="ghost" onClick={() => departmentsPage.setEditingDeptId(null)} className="h-11 rounded-xl px-6 font-bold text-slate-500 hover:text-slate-900">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={departmentsPage.isUpdatingDept} className="h-11 rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">
                    {departmentsPage.isUpdatingDept ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
