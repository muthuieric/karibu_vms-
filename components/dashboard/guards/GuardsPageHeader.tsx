"use client";

import { ContactRound, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Button } from "@/components/ui/button";

type GuardsPageHeaderProps = {
  onAddGuard: () => void;
};

export default function GuardsPageHeader({ onAddGuard }: GuardsPageHeaderProps) {
  return (
    <PageHeader
      title="Security team"
      description="Manage guards and assign them to entry points."
      icon={ContactRound}
    >
      <Button onClick={onAddGuard} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl h-11 px-6">
        <Plus className="h-4 w-4 mr-2" /> Add Guard
      </Button>
    </PageHeader>
  );
}
