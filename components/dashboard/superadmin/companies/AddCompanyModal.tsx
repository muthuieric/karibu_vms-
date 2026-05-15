"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, SelectField } from "@/components/dashboard/shared/Fields";
import { ModalShell } from "@/components/dashboard/shared/ModalShell";

type PlanType = "none" | "trial_1" | "trial_2";

type AddCompanyModalProps = {
  newCompanyName: string;
  planType: PlanType;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onNewCompanyNameChange: (value: string) => void;
  onPlanTypeChange: (value: PlanType) => void;
};

export default function AddCompanyModal({
  newCompanyName,
  planType,
  isSubmitting,
  onClose,
  onSubmit,
  onNewCompanyNameChange,
  onPlanTypeChange,
}: AddCompanyModalProps) {
  return (
    <ModalShell
      title="New Workspace"
      description="Create a workspace and choose its initial access plan."
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="new-workspace-form" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Workspace"}
          </Button>
        </div>
      }
    >
      <form id="new-workspace-form" onSubmit={onSubmit} className="space-y-5">
        <FormField label="Company / Building Name">
          <Input
            required
            placeholder="e.g. Skyline Towers"
            value={newCompanyName}
            onChange={(e) => onNewCompanyNameChange(e.target.value)}
          />
        </FormField>
        <FormField label="Initial Subscription Plan">
          <SelectField
            value={planType}
            onChange={(e) => onPlanTypeChange(e.target.value as PlanType)}
          >
            <option value="trial_1">1 Month Free Trial</option>
            <option value="trial_2">2 Months Free Trial</option>
            <option value="none">No Trial (Starts Unpaid & Locked)</option>
          </SelectField>
        </FormField>
      </form>
    </ModalShell>
  );
}
