"use client";

import { CheckCircle2, Clock, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type GuardStatsProps = {
  totalToday: number;
  pendingCount: number;
  checkedInCount: number;
};

export default function GuardStats({ totalToday, pendingCount, checkedInCount }: GuardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Total Today</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{totalToday}</h3>
          </div>
          <div className="p-3 bg-zinc-100/80 text-zinc-600 rounded-full">
            <UserPlus className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Pending</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{pendingCount}</h3>
          </div>
          <div className="p-3 bg-amber-100/80 text-amber-600 rounded-full">
            <Clock className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Checked In</p>
            <h3 className="text-3xl font-bold text-zinc-900 mt-1">{checkedInCount}</h3>
          </div>
          <div className="p-3 bg-green-100/80 text-green-600 rounded-full">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
