"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

export default function GateSuccessState() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-zinc-200 shadow-xl text-center p-8 bg-white/90 backdrop-blur-sm">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Registration Sent!</CardTitle>
        <p className="text-zinc-500 font-medium leading-relaxed">
          Your details have been securely transmitted. <strong className="text-zinc-900">Please wait for the security guard to approve your entry.</strong>
        </p>
      </Card>
    </div>
  );
}
