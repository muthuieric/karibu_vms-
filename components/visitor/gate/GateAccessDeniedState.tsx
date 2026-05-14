"use client";

import { AlertOctagon } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function GateAccessDeniedState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/15 text-center p-6">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/10 text-destructive">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <CardTitle className="text-2xl font-bold mb-2">Check-in Unavailable</CardTitle>
        <CardDescription className="text-base">
          This building&apos;s self-registration system is currently offline or suspended. Please speak directly to the security guard at the gate.
        </CardDescription>
      </Card>
    </div>
  );
}
