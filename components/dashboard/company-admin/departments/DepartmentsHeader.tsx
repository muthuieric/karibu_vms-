"use client";

import { Building2, Compass, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Button } from "@/components/ui/button";

type DepartmentsHeaderProps = {
  groupLabel?: string;
  userLabel?: string;
  onAddDepartment: () => void;
  onTakeTour?: () => void;
};

export default function DepartmentsHeader({
  groupLabel = "Department",
  userLabel = "Host",
  onAddDepartment,
  onTakeTour,
}: DepartmentsHeaderProps) {
  const pluralGroup = groupLabel.endsWith("s") ? groupLabel : `${groupLabel}s`;
  const pluralUser = userLabel.endsWith("s") ? userLabel : `${userLabel}s`;

  return (
    <div id="tour-departments-header">
      <PageHeader
        title={`${pluralGroup} & ${pluralUser}`}
        description={`Organize ${pluralGroup.toLowerCase()} and ${pluralUser.toLowerCase()} so visitors can quickly find who they are visiting.`}
        icon={Building2}
      >
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          {onTakeTour && (
            <Button
              type="button"
              variant="outline"
              onClick={onTakeTour}
              className="h-11 w-full sm:w-auto rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 font-bold px-4"
            >
              Page Tour
            </Button>
          )}
          <Button
            id="tour-departments-add-btn"
            onClick={onAddDepartment}
            className="h-11 w-full rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-700 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add {groupLabel}
          </Button>
        </div>
      </PageHeader>
    </div>
  );
}
