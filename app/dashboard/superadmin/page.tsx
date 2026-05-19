"use client";

import { useEffect, useState } from "react";
import GlobalPulseCard from "@/components/dashboard/superadmin/overview/GlobalPulseCard";
import PlatformKpiGrid from "@/components/dashboard/superadmin/overview/PlatformKpiGrid";
import SuperadminOverviewHeader from "@/components/dashboard/superadmin/overview/SuperadminOverviewHeader";
import SuperadminOverviewLoading from "@/components/dashboard/superadmin/overview/SuperadminOverviewLoading";
import WorkspaceLeaderboardCard from "@/components/dashboard/superadmin/overview/WorkspaceLeaderboardCard";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { getAuthHeaders } from "@/lib/client-auth";

type TopCompany = {
  id: string;
  name: string;
  visitors: number;
};

export default function SuperadminOverview() {
  const [loading, setLoading] = useState(true);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    goodStandingCompanies: 0,
    accountsOwing: 0,
    totalRevenue: 0,
    totalVisitors: 0,
    todayVisitors: 0,
    totalGuards: 0,
    pendingVisitors: 0,
    insideVisitors: 0
  });

  useEffect(() => {
    const fetchGlobalStats = async () => {
      setLoading(true);

      try {
        const response = await fetch("/api/superadmin/stats", { cache: "no-store", headers: await getAuthHeaders() });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Failed to fetch global stats.");
        }

        setStats({
          totalCompanies: payload.totalCompanies || 0,
          goodStandingCompanies: payload.goodStandingCompanies || 0,
          accountsOwing: payload.accountsOwing || 0,
          totalRevenue: payload.totalRevenue || 0,
          totalVisitors: payload.totalVisitors || 0,
          todayVisitors: payload.todayVisitors || 0,
          totalGuards: payload.totalGuards || 0,
          pendingVisitors: payload.pendingVisitors || 0,
          insideVisitors: payload.insideVisitors || 0
        });
        
        setTopCompanies(payload.topCompanies || []);

      } catch (error) {
        console.error("Failed to fetch global stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

  return (
    <PageContainer>
      <SuperadminOverviewHeader />

      {loading ? (
        <SuperadminOverviewLoading />
      ) : (
        <div className="space-y-6 md:space-y-8">
          <PlatformKpiGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <WorkspaceLeaderboardCard topCompanies={topCompanies} />
            <GlobalPulseCard stats={stats} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
