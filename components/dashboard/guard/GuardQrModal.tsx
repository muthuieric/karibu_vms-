"use client";

import { Copy, Printer, RefreshCw, ScanLine, ShieldCheck } from "lucide-react";
import { ModalShell } from "@/components/dashboard/shared/ModalShell";
import { QRDisplayCard } from "@/components/dashboard/shared/QRDisplayCard";
import { Button } from "@/components/ui/button";
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
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=18&data=${encodeURIComponent(qrUrl)}`;

  return (
    <ModalShell
      title="Gate QR display"
      description={`Let visitors register themselves for ${guardGateName}. This dynamic code refreshes for security.`}
      onClose={onClose}
      className="max-w-xl"
    >
      <div className="grid gap-5">
        <QRDisplayCard
          title="Scan to Register"
          description={`${guardGateName} visitor self check-in`}
          qrUrl={qrImageUrl}
          icon={ScanLine}
          footer={
            <div className="w-full space-y-4">
              <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">1</span>
                  Ask the visitor to scan with their phone camera.
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">2</span>
                  They complete the public check-in form.
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 font-black text-blue-700">3</span>
                  Approve or verify them from the visitor queue.
                </div>
              </div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                <RefreshCw className="h-3.5 w-3.5" />
                Code auto-rotates
              </p>
            </div>
          }
        />

        <div className="rounded-[1.25rem] border border-slate-200 bg-white p-3">
          <div className="flex gap-2">
            <Input readOnly value={qrUrl} className="h-11 text-xs font-medium text-slate-500" />
            <Button
              variant="outline"
              className="h-11 shrink-0"
              onClick={(e) => {
                navigator.clipboard.writeText(qrUrl);
                const btn = e.currentTarget;
                const oldText = btn.innerText;
                btn.innerText = "Copied";
                setTimeout(() => { btn.innerText = oldText; }, 2000);
              }}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>

        <Button className="h-12 w-full bg-blue-600 text-white hover:bg-blue-700" onClick={handlePrintQr}>
          <Printer className="h-4 w-4 mr-2" /> Print Static Poster
        </Button>
      </div>
    </ModalShell>
  );
}
