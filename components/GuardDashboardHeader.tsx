"use client";

import { LogOut, Radar, ScanLine, UserRoundPlus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { QuickActionButton } from "@/components/dashboard/shared/QuickActionButton";
import { Button } from "@/components/ui/button";

type GuardDashboardHeaderProps = {
  guardGateName: string;
  onLogout: () => void;
  onShowQr: () => void;
  onShowAddVisitor: () => void;
};

export default function GuardDashboardHeader({
  guardGateName,
  onLogout,
  onShowQr,
  onShowAddVisitor,
}: GuardDashboardHeaderProps) {
  return (
    <PageHeader
      title="Gate Dashboard"
      eyebrow="Security operations"
      description={`Live visitor monitoring for ${guardGateName}.`}
      icon={Radar}
    >
        <Button
          variant="outline"
          onClick={onLogout}
          className="flex-1 text-text-muted hover:text-destructive sm:flex-initial"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
        <QuickActionButton
          icon={ScanLine}
          variant="outline"
          onClick={onShowQr}
        >
          Show QR
        </QuickActionButton>
        <QuickActionButton icon={UserRoundPlus} onClick={onShowAddVisitor}>
          New Visitor
        </QuickActionButton>
    </PageHeader>
  );
}
