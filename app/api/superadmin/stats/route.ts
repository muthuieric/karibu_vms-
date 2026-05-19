import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/billing/server";
import { getSafeErrorResponse, requireRole } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireRole(request, ["superadmin"]);
    const supabaseAdmin = createSupabaseAdmin();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      companiesRes,
      revenueRes,
      visitorsRes,
      todayVisitorsRes,
      pendingVisitorsRes,
      insideVisitorsRes,
      guardsRes,
      visitorCompaniesRes,
    ] = await Promise.all([
      supabaseAdmin.from("companies").select("id, name, is_locked, hard_locked, current_balance, plan_tier, subscription_status"),
      supabaseAdmin.from("transactions").select("amount, status"),
      supabaseAdmin.from("visitors").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("visitors").select("id", { count: "exact", head: true }).gte("created_at", startOfToday.toISOString()),
      supabaseAdmin.from("visitors").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("visitors").select("id", { count: "exact", head: true }).eq("status", "checked_in"),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "guard"),
      supabaseAdmin.from("visitors").select("company_id"),
    ]);

    if (companiesRes.error) throw companiesRes.error;
    if (revenueRes.error) throw revenueRes.error;
    if (visitorsRes.error) throw visitorsRes.error;
    if (todayVisitorsRes.error) throw todayVisitorsRes.error;
    if (pendingVisitorsRes.error) throw pendingVisitorsRes.error;
    if (insideVisitorsRes.error) throw insideVisitorsRes.error;
    if (guardsRes.error) throw guardsRes.error;
    if (visitorCompaniesRes.error) throw visitorCompaniesRes.error;

    const companies = companiesRes.data || [];
    const totalCompanies = companies.length;
    const activeCompanies = companies.filter((company) => !company.is_locked && !company.hard_locked).length;
    const goodStandingCompanies = companies.filter(
      (company) =>
        !company.is_locked &&
        !company.hard_locked &&
        (Number(company.current_balance || 0) <= 0 || company.subscription_status === "trial")
    ).length;
    const accountsOwing = companies.filter(
      (company) => !company.hard_locked && Number(company.current_balance || 0) > 0
    ).length;
    const totalRevenue = (revenueRes.data || []).reduce((sum, tx) => {
      const status = String(tx.status || "").toLowerCase();
      return status === "paid" || status === "completed" || status === "success" ? sum + Number(tx.amount || 0) : sum;
    }, 0);

    const companyCounts: Record<string, number> = {};
    (visitorCompaniesRes.data || []).forEach((visitor) => {
      if (visitor.company_id) {
        companyCounts[visitor.company_id] = (companyCounts[visitor.company_id] || 0) + 1;
      }
    });

    const topCompanies = companies
      .map((company) => ({
        id: company.id,
        name: company.name,
        visitors: companyCounts[company.id] || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 6);

    return NextResponse.json({
      totalCompanies,
      activeCompanies,
      goodStandingCompanies,
      accountsOwing,
      totalRevenue,
      totalVisitors: visitorsRes.count || 0,
      todayVisitors: todayVisitorsRes.count || 0,
      totalGuards: guardsRes.count || 0,
      pendingVisitors: pendingVisitorsRes.count || 0,
      insideVisitors: insideVisitorsRes.count || 0,
      topCompanies,
    });
  } catch (error) {
    console.error("Superadmin stats error:", error);
    const safeError = getSafeErrorResponse(error, "Superadmin stats could not be loaded.");
    return NextResponse.json({ error: safeError.message }, { status: safeError.status });
  }
}
