"use client";

import Image from "next/image";
import { Printer, RefreshCw, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type GuardQrModalProps = {
  isOpen: boolean;
  onClose: () => void;
  qrUrl: string;
  guardGateName: string;
  handlePrintQr: () => void;
};

export default function GuardQrModal({
  isOpen,
  onClose,
  qrUrl,
  guardGateName,
  handlePrintQr,
}: GuardQrModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <Card className="w-full max-w-sm shadow-2xl relative border-0 rounded-xl overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>
        <CardHeader className="pt-8 pb-2 text-center">
          <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight">Scan to Register</CardTitle>
          <CardDescription className="text-zinc-500 font-medium">
            Visitor Self-Check-In
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
          <div className="p-4 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm relative group">
            <div className="absolute -top-3 -right-3 bg-blue-100 text-blue-700 p-1.5 rounded-full shadow-sm animate-pulse">
              <RefreshCw size={16} />
            </div>

            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`}
              alt={`${guardGateName} check-in QR code`}
              width={250}
              height={250}
              className="rounded-lg"
              unoptimized
            />
          </div>
          <div className="text-center">
            <p className="text-sm text-zinc-500 max-w-[250px] mx-auto font-medium">
              Have the visitor scan this code with their smartphone camera.
            </p>
            <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mt-2 bg-emerald-50 py-1 px-2 rounded inline-block">
              <ShieldCheck className="w-3 h-3 inline mr-1 mb-0.5" /> Code auto-rotates for security
            </p>
          </div>

          <div className="w-full flex gap-2">
            <Input readOnly value={qrUrl} className="h-10 text-xs bg-zinc-50 text-zinc-500" />
            <Button
              variant="outline"
              className="h-10 shrink-0 border-zinc-200"
              onClick={(e) => {
                navigator.clipboard.writeText(qrUrl);
                const btn = e.currentTarget;
                const oldText = btn.innerText;
                btn.innerText = "Copied!";
                setTimeout(() => { btn.innerText = oldText; }, 2000);
              }}
            >
              Copy
            </Button>
          </div>

          <div className="flex gap-3 w-full mt-2 pt-4 border-t border-zinc-100">
            <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" onClick={handlePrintQr}>
              <Printer className="w-4 h-4 mr-2" /> Print Static Poster
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
