"use client";

import { Factory, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Button } from "@/components/ui/button";

type SuperadminCompaniesHeaderProps = {
  onNewCompany: () => void;
};

export default function SuperadminCompaniesHeader({ onNewCompany }: SuperadminCompaniesHeaderProps) {
  return (
    <PageHeader
      title="Client Companies"
      eyebrow="Workspace directory"
      description="Manage organizations, plans, admins, approvals, and lock states from a platform-level view."
      icon={Factory}
      tone="dark"
    >
      <Button onClick={onNewCompany} className="bg-zinc-900 hover:bg-zinc-800 text-white w-full sm:w-auto shadow-sm">
        <Plus className="h-4 w-4" /> New Company
      </Button>
    </PageHeader>
  );
}
