"use client";

import Image from "next/image";
import { LogOutIcon, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuardDashboardHeaderProps = {
  guardGateName: string;
  onLogout: () => void;
  onShowIncidentReport: () => void;
};

export default function GuardDashboardHeader({
  guardGateName,
  onLogout,
  onShowIncidentReport,
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
      
      <div className="grid gap-2 sm:flex sm:items-center sm:gap-3">
        <Button
          variant="outline"
          onClick={onShowIncidentReport}
          className="h-11 w-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 sm:w-auto"
        >
          <ShieldAlert className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="h-11 w-full text-slate-500 hover:bg-slate-100 hover:text-red-600 sm:w-auto"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
