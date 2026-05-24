"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Clock3, Download, LockKeyhole, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type PassStatus = "pending" | "approved" | "rejected" | "checked_out";

export type SafeVisitorPass = {
  visitorName: string;
  hostName?: string | null;
  companyName: string;
  gateName?: string | null;
  status: PassStatus;
  date?: string | null;
  checkedInAt?: string | null;
  checkedOutAt?: string | null;
  passCode?: string | null;
  passExpiredAt?: string | null;
};

type VisitorPassCardProps = {
  pass: SafeVisitorPass;
  passUrl?: string | null;
};

const statusConfig: Record<PassStatus, { label: string; tone: string; icon: typeof Clock3; message: string }> = {
  pending: {
    label: "Pending Verification",
    tone: "border-orange-200 bg-orange-50 text-orange-800",
    icon: LockKeyhole,
    message: "Please show this pass to security.",
  },
  approved: {
    label: "Approved",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
    message: "Entry approved. Welcome.",
  },
  rejected: {
    label: "Rejected",
    tone: "border-red-200 bg-red-50 text-red-800",
    icon: ShieldAlert,
    message: "Please contact security for assistance.",
  },
  checked_out: {
    label: "Checked Out",
    tone: "border-slate-200 bg-slate-50 text-slate-700",
    icon: CheckCircle2,
    message: "This pass has expired.",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "Today";
  return new Date(value).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export default function VisitorPassCard({ pass, passUrl }: VisitorPassCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const config = statusConfig[pass.status] || statusConfig.pending;
  const StatusIcon = config.icon;
  const checkedInTime = formatTime(pass.checkedInAt);
  const checkedOutTime = formatTime(pass.checkedOutAt || pass.passExpiredAt);
  const passCodeLabel = pass.status === "checked_out" || pass.passExpiredAt ? "Expired" : pass.passCode || "Locked";
  const passDate = useMemo(() => formatDate(pass.checkedInAt || pass.date), [pass.checkedInAt, pass.date]);

  useEffect(() => {
    let active = true;

    if (!passUrl) return;

    QRCode.toDataURL(passUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    }).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl);
    }).catch(() => {
      if (active) setQrDataUrl(null);
    });

    return () => {
      active = false;
    };
  }, [passUrl]);

  const handleDownloadPass = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#dbeafe";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(70, 60, 760, 1380, 36);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(70, 60, 760, 185, 36);
    ctx.fill();
    ctx.fillRect(70, 175, 760, 70);

    try {
      const logo = await loadImage("/icon.svg");
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(110, 100, 86, 86, 22);
      ctx.fill();
      ctx.drawImage(logo, 124, 114, 58, 58);
    } catch {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(110, 100, 86, 86, 22);
      ctx.fill();
      ctx.fillStyle = "#2563eb";
      ctx.font = "700 34px Arial";
      ctx.fillText("K", 140, 156);
    }

    ctx.fillStyle = "#bfdbfe";
    ctx.font = "700 24px Arial";
    ctx.fillText("KARIBU VMS", 220, 130);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 42px Arial";
    ctx.fillText(pass.companyName.slice(0, 26), 220, 180);

    ctx.fillStyle = pass.status === "approved" ? "#ecfdf5" : pass.status === "rejected" ? "#fef2f2" : pass.status === "checked_out" ? "#f8fafc" : "#fff7ed";
    ctx.strokeStyle = pass.status === "approved" ? "#a7f3d0" : pass.status === "rejected" ? "#fecaca" : pass.status === "checked_out" ? "#e2e8f0" : "#fed7aa";
    ctx.beginPath();
    ctx.roundRect(110, 285, 680, 92, 24);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = pass.status === "approved" ? "#065f46" : pass.status === "rejected" ? "#991b1b" : pass.status === "checked_out" ? "#334155" : "#9a3412";
    ctx.font = "800 34px Arial";
    ctx.fillText(config.label, 140, 343);

    ctx.fillStyle = "#64748b";
    ctx.font = "700 22px Arial";
    ctx.fillText("VISITOR", 110, 445);
    ctx.fillStyle = "#020617";
    ctx.font = "900 58px Arial";
    ctx.fillText(pass.visitorName.slice(0, 23), 110, 510);

    const details = [
      ["Host", pass.hostName || "Security desk"],
      ["Gate", pass.gateName || "Main entry"],
      ["Pass Code", passCodeLabel],
      ["Date", passDate],
      ["Time In", checkedInTime || (pass.status === "approved" || pass.status === "checked_out" ? "Recorded" : "Locked")],
      ...(pass.status === "checked_out" ? [["Time Out", checkedOutTime || "Recorded"]] : []),
      ["Status", config.label],
    ];

    let y = 600;
    details.forEach(([label, value]) => {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 22px Arial";
      ctx.fillText(label.toUpperCase(), 110, y);
      ctx.fillStyle = "#334155";
      ctx.font = "800 32px Arial";
      ctx.fillText(String(value).slice(0, 34), 110, y + 42);
      y += 78;
    });

    if (passUrl) {
      const qrForDownload = qrDataUrl || await QRCode.toDataURL(passUrl, { margin: 1, width: 320 });
      const qrImage = await loadImage(qrForDownload);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.roundRect(290, 1140, 320, 320, 28);
      ctx.fill();
      ctx.stroke();
      ctx.drawImage(qrImage, 310, 1160, 280, 280);
    }

    const link = document.createElement("a");
    link.download = `karibu-visitor-pass-${pass.visitorName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "visitor"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-xl shadow-blue-950/10">
      <div className="bg-slate-950 px-5 py-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white">
              <Image src="/icon.svg" alt="Karibu VMS logo" width={34} height={34} className="h-8 w-8 object-contain" priority />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Karibu VMS</p>
              <h1 className="truncate text-xl font-black tracking-tight">{pass.companyName}</h1>
            </div>
          </div>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black ${config.tone}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Visitor</p>
          <p className="mt-1 break-words text-2xl font-black text-slate-950">{pass.visitorName}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Host</p>
              <p className="mt-1 font-bold text-slate-700">{pass.hostName || "Security desk"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Gate</p>
              <p className="mt-1 font-bold text-slate-700">{pass.gateName || "Main entry"}</p>
            </div>
          </div>
        </div>

        {passUrl && (
          <div className="mx-auto rounded-[1.35rem] border border-slate-200 bg-white p-3 shadow-sm">
            {qrDataUrl ? (
              <Image src={qrDataUrl} alt="Visitor pass QR code" width={220} height={220} unoptimized className="h-56 w-56 rounded-xl" />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-xl bg-slate-50 text-sm font-bold text-slate-500">
                Loading QR...
              </div>
            )}
          </div>
        )}

        <div className={`rounded-2xl border p-4 text-center ${config.tone}`} role="status">
          <p className="text-sm font-black">{config.message}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pass Code</p>
          <p className={`mt-1 text-3xl font-black ${passCodeLabel === "Expired" ? "text-slate-500" : "tracking-[0.2em] text-slate-950"}`}>
            {passCodeLabel}
          </p>
        </div>

        <div className={`grid gap-3 text-center ${pass.status === "checked_out" ? "grid-cols-3" : "grid-cols-2"}`}>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Date</p>
            <p className="mt-1 text-sm font-black text-slate-800">{passDate}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Time In</p>
            <p className="mt-1 text-sm font-black text-slate-800">{checkedInTime || (pass.status === "approved" || pass.status === "checked_out" ? "Recorded" : "Locked")}</p>
          </div>
          {pass.status === "checked_out" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Time Out</p>
              <p className="mt-1 text-sm font-black text-slate-800">{checkedOutTime || "Recorded"}</p>
            </div>
          )}
        </div>

        {passUrl && (
          <Button
            type="button"
            onClick={handleDownloadPass}
            className="h-12 w-full rounded-xl bg-blue-600 text-base font-black text-white shadow-sm hover:bg-blue-700"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Pass
          </Button>
        )}
      </div>
    </div>
  );
}
