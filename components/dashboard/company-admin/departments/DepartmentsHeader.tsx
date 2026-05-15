"use client";

import { Building2, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Button } from "@/components/ui/button";

type DepartmentsHeaderProps = {
  onAddDepartment: () => void;
};

export default function DepartmentsHeader({ onAddDepartment }: DepartmentsHeaderProps) {
  return (
    <PageHeader
      title="Departments & Hosts"
      description="Organize departments and hosts so visitors can quickly find who they are visiting."
      icon={Building2}
    >
      <Button onClick={onAddDepartment} className="h-11 w-full rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-700 sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Add Department
      </Button>
    </PageHeader>
  );
}
