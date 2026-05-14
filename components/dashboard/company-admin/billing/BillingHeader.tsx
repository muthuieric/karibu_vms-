"use client";

import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Badge } from "@/components/ui/badge";

export default function BillingHeader() {
  return (
    <PageHeader
      title="Billing & Wallet"
      description="Manage usage, outstanding balances, and transaction history."
      icon={ShieldCheck}
    >
      <Badge variant="success" className="gap-2">
        <ShieldCheck className="h-3.5 w-3.5" /> Secure SSL Connection
      </Badge>
    </PageHeader>
  );
}
