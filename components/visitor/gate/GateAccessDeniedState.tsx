"use client";

import { AlertOctagon } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function GateAccessDeniedState() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-900 bg-zinc-900 text-zinc-100 shadow-2xl text-center p-6">
        <AlertOctagon className="w-16 h-16 text-red-50 mx-auto mb-4" />
        <CardTitle className="text-2xl font-bold text-white mb-2">Check-in Unavailable</CardTitle>
        <CardDescription className="text-zinc-400 text-base">
          This building&apos;s self-registration system is currently offline or suspended. Please speak directly to the security guard at the gate.
        </CardDescription>
      </Card>
    </div>
  );
}
