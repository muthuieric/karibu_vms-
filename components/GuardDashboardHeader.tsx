"use client";

import { DoorOpen, LogOut, QrCode, UserPlus } from "lucide-react";
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Gate Dashboard</h1>
        <p className="text-zinc-500 flex items-center gap-1.5 mt-1">
          <DoorOpen className="w-4 h-4" />
          Live monitoring • <span className="font-semibold text-zinc-700">{guardGateName}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <Button
          variant="outline"
          onClick={onLogout}
          className="flex-1 sm:flex-initial border-zinc-200 text-zinc-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-white/80 backdrop-blur-sm"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
        <Button
          variant="outline"
          onClick={onShowQr}
          className="flex-1 sm:flex-initial bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm"
        >
          <QrCode className="w-4 h-4 mr-2" /> Show QR
        </Button>
        <Button onClick={onShowAddVisitor} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 shadow-md">
          <UserPlus className="w-4 h-4 mr-2 hidden sm:inline-block" /> + New Visitor
        </Button>
      </div>
    </div>
  );
}
