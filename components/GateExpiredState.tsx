"use client";

import { AlertOctagon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

export default function GateExpiredState() {
  return (
    <div className="w-full max-w-md mx-auto relative z-10 px-4">
      <Card className="text-center p-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-warning/20 bg-warning/10 text-warning-foreground">
          <AlertOctagon className="w-10 h-10" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight mb-2">
          QR Code Expired
        </CardTitle>
        <p className="text-text-muted font-medium leading-relaxed">
          For security reasons, this dynamic QR code has expired. Please return to the security desk and scan the code again.
        </p>
      </Card>
    </div>
  );
}
