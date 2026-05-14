"use client";

import { Plus, Shield } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Button } from "@/components/ui/button";

type GuardsPageHeaderProps = {
  onAddGuard: () => void;
};

export default function GuardsPageHeader({ onAddGuard }: GuardsPageHeaderProps) {
  return (
    <PageHeader
      title="Security Team"
      description="Manage guard accounts, assigned gates, and the desk access your security team uses every day."
      icon={Shield}
    >
      <Button onClick={onAddGuard} className="w-full sm:w-auto">
        <Plus className="h-4 w-4" /> Add New Guard
      </Button>
    </PageHeader>
  );
}
