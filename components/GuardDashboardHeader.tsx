"use client";

import Image from "next/image";
import { LogOutIcon, ScanQrCode, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuardDashboardHeaderProps = {
  guardGateName: string;
  onLogout: () => void;
  onShowQr: () => void;
  onShowAddVisitor: () => void;
};

export default function GuardDashboardHeader({
  guardGateName,
  onLogout,
  onShowQr,
  onShowAddVisitor,
}: GuardDashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
          <Image
            src="/icon.svg"
            alt="Karibu VMS logo"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Guard Workspace</p>
          <h1 className="text-xl font-bold text-slate-900">{guardGateName}</h1>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={onShowQr}
          className="h-11 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
        >
          <ScanQrCode className="mr-2 h-4 w-4" />
          Show QR
        </Button>
        <Button
          onClick={onShowAddVisitor}
          className="h-11 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
        >
          <UserPlus2 className="mr-2 h-4 w-4" />
          New Visitor
        </Button>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="h-11 text-slate-500 hover:bg-slate-100 hover:text-red-600"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
