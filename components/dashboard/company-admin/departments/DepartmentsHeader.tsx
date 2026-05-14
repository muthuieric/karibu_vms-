"use client";

import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";

export default function DepartmentsHeader() {
  return (
    <PageHeader
      title="Departments & Hosts"
      description="Organize departments and hosts so visitors can quickly find who they are visiting."
      icon={Building2}
    />
  );
}
