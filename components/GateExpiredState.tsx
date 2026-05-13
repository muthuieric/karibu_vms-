"use client";

import { AlertOctagon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";

export default function GateExpiredState() {
  return (
    <div className="w-full max-w-md mx-auto relative z-10 px-4">
      <Card className="border-zinc-200 shadow-xl text-center p-8 bg-white/95 backdrop-blur-md">
        <AlertOctagon className="w-20 h-20 text-amber-500 mx-auto mb-6" />
        <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
          QR Code Expired
        </CardTitle>
        <p className="text-zinc-500 font-medium leading-relaxed">
          For security reasons, this dynamic QR code has expired. Please return to the security desk and scan the code again.
        </p>
      </Card>
    </div>
  );
}
