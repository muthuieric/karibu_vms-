"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GlobalPulseCard from "@/components/dashboard/superadmin/overview/GlobalPulseCard";
import PlatformKpiGrid from "@/components/dashboard/superadmin/overview/PlatformKpiGrid";
import SuperadminOverviewHeader from "@/components/dashboard/superadmin/overview/SuperadminOverviewHeader";
import SuperadminOverviewLoading from "@/components/dashboard/superadmin/overview/SuperadminOverviewLoading";
import WorkspaceLeaderboardCard from "@/components/dashboard/superadmin/overview/WorkspaceLeaderboardCard";
import { PageContainer } from "@/components/dashboard/shared/AppShell";

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
    activeCompanies: 0,
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
      
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      try {
        // 1. Company Stats (Total & Active)
        const { data: companiesData } = await supabase
          .from("companies")
          .select("id, name, is_locked, subscription_ends_at");
          
        const totalCompanies = companiesData?.length || 0;
        const activeCompanies = (companiesData || []).filter(c => {
          const isExpired = c.subscription_ends_at ? new Date(c.subscription_ends_at) < new Date() : true;
          return !c.is_locked && !isExpired;
        }).length;

        // 2. Revenue Stats
        const { data: txData } = await supabase
          .from("transactions")
          .select("amount")
          .ilike("status", "%completed%");
          
        const totalRevenue = (txData || []).reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

        // 3. Visitor Stats
        const { count: visitorCount } = await supabase.from("visitors").select("*", { count: "exact", head: true });
        const { count: todayVisitorCount } = await supabase.from("visitors").select("*", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString());
        const { count: pendingCount } = await supabase.from("visitors").select("*", { count: "exact", head: true }).eq("status", "pending");
        const { count: insideCount } = await supabase.from("visitors").select("*", { count: "exact", head: true }).eq("status", "checked_in");

        // 4. Guard Stats
        const { count: guardCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "guard");

        // 5. Calculate Top Companies Leaderboard (The Competition)
        const { data: visitorIds } = await supabase.from("visitors").select("company_id");
        
        const companyCounts: Record<string, number> = {};
        (visitorIds || []).forEach(v => {
          if (v.company_id) {
            companyCounts[v.company_id] = (companyCounts[v.company_id] || 0) + 1;
          }
        });

        const leaderboard = (companiesData || [])
          .map(c => ({
            id: c.id,
            name: c.name,
            visitors: companyCounts[c.id] || 0
          }))
          .sort((a, b) => b.visitors - a.visitors)
          .slice(0, 6); // Top 6 for the grid

        setStats({
          totalCompanies,
          activeCompanies,
          totalRevenue,
          totalVisitors: visitorCount || 0,
          todayVisitors: todayVisitorCount || 0,
          totalGuards: guardCount || 0,
          pendingVisitors: pendingCount || 0,
          insideVisitors: insideCount || 0
        });
        
        setTopCompanies(leaderboard);

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
