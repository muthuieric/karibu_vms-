"use client";

import Image from "next/image";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GuardQrModalProps = {
  companyId: string | null;
  guardGateId: string | null;
  onClose: () => void;
  onPrintQr: () => void;
};

export default function GuardQrModal({ companyId, guardGateId, onClose, onPrintQr }: GuardQrModalProps) {
  if (!companyId) return null;

  const registrationUrl = `${window.location.origin}/${companyId}/gate${guardGateId ? `?gateId=${guardGateId}` : ""}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-sm shadow-2xl relative border-0 rounded-xl overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>
        <CardHeader className="pt-8 pb-2 text-center">
          <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight">Scan to Register</CardTitle>
          <CardDescription className="text-zinc-500 font-medium">Visitor Self-Check-In</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="p-4 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm">
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationUrl)}`}
              alt="Check-in QR Code"
              width={250}
              height={250}
              className="rounded-lg"
              unoptimized
            />
          </div>
          <p className="text-sm text-zinc-500 text-center max-w-[250px]">
            Have the visitor scan this code with their smartphone camera to open the registration form.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                navigator.clipboard.writeText(registrationUrl);
                alert("Link copied to clipboard!");
              }}
            >
              Copy Link
            </Button>
            <Button className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white" onClick={onPrintQr}>
              <Printer className="w-4 h-4 mr-2" /> Print QR
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
