"use client";

import { Clock, Loader2, LogIn, LogOut, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type VisitorStats = {
  total: number;
  inside: number;
  departed: number;
  pending: number;
};

type CompanyVisitorStatsModalProps = {
  companyName: string;
  visitorStats: VisitorStats;
  loadingVisitors: boolean;
  onClose: () => void;
};

export default function CompanyVisitorStatsModal({
  companyName,
  visitorStats,
  loadingVisitors,
  onClose,
}: CompanyVisitorStatsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl relative border-0 overflow-hidden bg-white">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors">
          <X size={18} />
        </button>
        <CardHeader className="pt-8 pb-4 border-b border-zinc-100/50">
          <CardTitle className="text-xl font-bold truncate pr-6 text-zinc-900">{companyName}</CardTitle>
          <CardDescription>Real-time Visitor Analytics Snapshot</CardDescription>
        </CardHeader>
        <CardContent className="p-6 bg-zinc-50/50">
          {loadingVisitors ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <p className="text-zinc-500 font-medium">Aggregating data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-center">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Lifetime Visitors</p>
                <div className="text-5xl font-black text-indigo-600 tracking-tighter">
                  {visitorStats.total.toLocaleString()}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm text-center flex flex-col items-center border-b-2 border-b-amber-400">
                  <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-2">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-zinc-900">{visitorStats.pending}</div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-wider">Pending</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm text-center flex flex-col items-center border-b-2 border-b-green-500">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-zinc-900">{visitorStats.inside}</div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-wider">Inside</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm text-center flex flex-col items-center border-b-2 border-b-zinc-400">
                  <div className="w-8 h-8 bg-zinc-100 text-zinc-600 rounded-full flex items-center justify-center mb-2">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-bold text-zinc-900">{visitorStats.departed}</div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-wider">Departed</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
