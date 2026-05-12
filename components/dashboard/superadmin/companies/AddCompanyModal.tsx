"use client";

import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl relative border-0 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>
        <CardHeader className="pt-8 pb-4 border-b border-zinc-100/50">
          <CardTitle className="text-xl font-bold">Onboard New Company</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label className="font-semibold text-zinc-700">Company / Building Name</Label>
              <Input
                required
                placeholder="e.g. Skyline Towers"
                value={newCompanyName}
                onChange={(e) => onNewCompanyNameChange(e.target.value)}
                className="mt-1.5 h-11 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label className="font-semibold text-zinc-700">Initial Subscription Plan</Label>
              <select
                value={planType}
                onChange={(e) => onPlanTypeChange(e.target.value as PlanType)}
                className="w-full mt-1.5 border border-zinc-200 rounded-md h-11 px-3 bg-zinc-50 focus:bg-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
              >
                <option value="trial_1">1 Month Free Trial</option>
                <option value="trial_2">2 Months Free Trial</option>
                <option value="none">No Trial (Starts Unpaid & Locked)</option>
              </select>
            </div>
            <div className="pt-4">
              <Button type="submit" className="w-full h-11 text-base font-bold bg-zinc-900 hover:bg-zinc-800" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</> : "Create Workspace"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
