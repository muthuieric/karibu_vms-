"use client";

import { Crown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TopCompany = {
  id: string;
  name: string;
  visitors: number;
};

type WorkspaceLeaderboardCardProps = {
  topCompanies: TopCompany[];
};

export default function WorkspaceLeaderboardCard({ topCompanies }: WorkspaceLeaderboardCardProps) {
  return (
    <Card className="lg:col-span-2 shadow-sm border-zinc-200/60 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="border-b border-zinc-100/50 pb-4 bg-zinc-50/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> Workspace Leaderboard
            </CardTitle>
            <CardDescription>Most active client buildings by visitor traffic.</CardDescription>
          </div>
          <div className="px-2 py-1 bg-amber-50 border border-amber-100 rounded-md text-[10px] font-bold text-amber-600 uppercase tracking-wider">
            Platform Rank
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topCompanies.map((company, index) => {
            const maxVis = topCompanies[0]?.visitors || 1;
            const percentage = Math.max((company.visitors / maxVis) * 100, 5);

            return (
              <div key={company.id} className="relative p-4 rounded-xl bg-white border border-zinc-100 overflow-hidden shadow-sm group">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-blue-50/70 z-0 transition-all duration-1000 ease-out"
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative z-10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {index === 0 ? (
                      <Crown className="text-amber-500 w-5 h-5 drop-shadow-sm animate-bounce" />
                    ) : (
                      <div className="w-5 text-center font-bold text-zinc-300 text-sm">{index + 1}</div>
                    )}
                    <span className="font-bold text-zinc-900 text-sm truncate max-w-[120px]">{company.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-blue-600 text-lg leading-none">{company.visitors.toLocaleString()}</div>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5">Visits</p>
                  </div>
                </div>
              </div>
            );
          })}
          {topCompanies.length === 0 && (
            <div className="col-span-2 py-10 text-center text-zinc-400 italic">No visitor data accumulated yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
