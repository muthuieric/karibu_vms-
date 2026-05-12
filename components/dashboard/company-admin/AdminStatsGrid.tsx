"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminStatsGridProps = {
  totalToday: number;
  currentlyInside: number;
  pendingCount: number;
  lifetimeVisitors: number;
};

export default function AdminStatsGrid({
  totalToday,
  currentlyInside,
  pendingCount,
  lifetimeVisitors,
}: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <Card className="border-t-4 border-t-blue-600 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-zinc-500 uppercase tracking-wider">Total Visitors Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl md:text-4xl font-bold text-zinc-900">{totalToday}</div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-green-600 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-zinc-500 uppercase tracking-wider">Currently Inside</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl md:text-4xl font-bold text-green-600">{currentlyInside}</div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-purple-600 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-zinc-500 uppercase tracking-wider">Active Gate Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl md:text-4xl font-bold text-purple-600">{pendingCount}</div>
        </CardContent>
      </Card>

      <Card className="border-t-4 border-t-zinc-900 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs md:text-sm font-medium text-zinc-500 uppercase tracking-wider">Lifetime Visitors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl md:text-4xl font-bold text-zinc-900">
            {lifetimeVisitors.toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
