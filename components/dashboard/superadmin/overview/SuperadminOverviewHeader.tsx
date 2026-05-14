"use client";

import { CircuitBoard } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";

export default function SuperadminOverviewHeader() {
  return (
    <PageHeader
      title="Platform Pulse"
      eyebrow="Superadmin command center"
      description="Real-time client, revenue, guard, and visitor analytics across the Karibu VMS network."
      icon={CircuitBoard}
      tone="dark"
    />
  );
}
