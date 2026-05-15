"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

export default function GateSuccessState() {
  return (
    <div className="relative z-10 flex w-full justify-center p-4">
      <Card className="w-full max-w-md text-center p-8 bg-white">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-success/15 bg-success/10 text-success">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight mb-2">Registration Sent</CardTitle>
        <p className="text-text-muted font-medium leading-relaxed">
          Your details have been securely transmitted. <strong className="text-text-main">Please wait for the security guard to approve your entry.</strong>
        </p>
      </Card>
    </div>
  );
}
