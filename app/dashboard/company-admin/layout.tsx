"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertOctagon, LayoutDashboard, SquareCode, ContactRound, ClipboardList, Landmark, WalletCards, MessageCircleQuestion, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { DashboardSidebar, type DashboardNavItem } from "@/components/dashboard/shared/DashboardSidebar";
import { HardLockedScreen } from "@/components/dashboard/shared/HardLockedScreen";
import { LockedAccountBanner } from "@/components/dashboard/shared/LockedAccountBanner";
import { LoadingState } from "@/components/dashboard/shared/StateBlocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const adminNavItems: DashboardNavItem[] = [
  { href: "/dashboard/company-admin", label: "Admin Home", exact: true, icon: LayoutDashboard },
  { href: "/dashboard/company-admin/qr", label: "Gate QR Code", icon: SquareCode },
  { href: "/dashboard/company-admin/guards", label: "Security Team", icon: ContactRound },
  { href: "/dashboard/company-admin/security", label: "Security Center", icon: ShieldCheck },
  { href: "/dashboard/company-admin/rules", label: "Building Rules", icon: ClipboardList },
  { href: "/dashboard/company-admin/departments", label: "Departments", icon: Landmark },
  { href: "/dashboard/company-admin/billing", label: "Payments", icon: WalletCards },
  { href: "/dashboard/company-admin/support", label: "Help Desk", icon: MessageCircleQuestion },
  { href: "/dashboard/company-admin/settings", label: "Account", icon: SlidersHorizontal },
];

export default function CompanyAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isHardLocked, setIsHardLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [visitorCount, setVisitorCount] = useState(0);
  const [amountDue, setAmountDue] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const verifyAccountStatus = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();

        if (authData?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("company_id, role")
            .eq("id", authData.user.id)
            .single();

          if (profile?.role === "guard") {
            router.replace("/dashboard/guard");
            setLoading(false);
            return;
          }

          if (profile?.company_id) {
            const { data: company } = await supabase
              .from("companies")
              .select("is_locked, hard_locked, created_at")
              .eq("id", profile.company_id)
              .single();

            const role = (profile.role || "").trim().toLowerCase();
            const isCompanyUser = role === "admin" || role === "company_admin" || role === "company-admin";
            if (isCompanyUser && company?.hard_locked === true) {
              setIsHardLocked(true);
              setLoading(false);
              return;
            }

            let countStartDate = company?.created_at || new Date().toISOString();

            const { data: recentTx } = await supabase
              .from("transactions")
              .select("created_at, status")
              .eq("company_id", profile.company_id)
              .order("created_at", { ascending: false })
              .limit(10);

            if (recentTx && recentTx.length > 0) {
              const lastPaid = recentTx.find((tx) =>
                tx.status &&
                (tx.status.toUpperCase() === "COMPLETED" ||
                  tx.status.toUpperCase() === "SUCCESS" ||
                  tx.status.toUpperCase() === "PAID")
              );

              if (lastPaid) countStartDate = lastPaid.created_at;
            }

            const { count } = await supabase
              .from("visitors")
              .select("*", { count: "exact", head: true })
              .eq("company_id", profile.company_id)
              .gte("created_at", countStartDate);

            const unpaidVisitors = count || 0;
            setVisitorCount(unpaidVisitors);
            setAmountDue(unpaidVisitors * 3);
            setIsLocked(company?.is_locked === true);
          }
        }
      } catch (error) {
        console.error("Error verifying account status:", error);
      } finally {
        setLoading(false);
      }
    };

    verifyAccountStatus();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4">
        <LoadingState label="Verifying admin access..." />
      </div>
    );
  }

  if (isHardLocked) {
    return <HardLockedScreen onBackToLogin={handleLogout} />;
  }

  const safePathname = pathname || "";
  const normalizedPath = safePathname.endsWith("/") ? safePathname.slice(0, -1) : safePathname;
  const isPaymentSuccessPage = normalizedPath.includes("/payment-success");
  const isExactAdminPage = normalizedPath === "/dashboard/company-admin";
  const isDepartmentsPage = normalizedPath.includes("/departments");
  const isSecurityPage = normalizedPath.includes("/security") || normalizedPath.includes("/blacklist");
  const isRestrictedRoute = isExactAdminPage || isDepartmentsPage || isSecurityPage;
  const showLockdownPopup = isLocked && isRestrictedRoute && !isPaymentSuccessPage;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F8FAFC] md:flex-row">
      <DashboardSidebar
        pathname={normalizedPath}
        navItems={adminNavItems}
        isMobileOpen={isMobileMenuOpen}
        onMobileOpenChange={setIsMobileMenuOpen}
        onLogout={handleLogout}
      />

      <main id="main-content" className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {isLocked && !isPaymentSuccessPage && (
          <LockedAccountBanner
            title="Account locked"
            message="Your account has been locked manually by administration."
          />
        )}

        <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {showLockdownPopup ? (
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <Card className="w-full max-w-md border-red-200 bg-white rounded-[1.4rem] shadow-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600">
                    <AlertOctagon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Access Restricted</CardTitle>
                  <CardDescription className="text-slate-500">
                    Management logs, departments, and restricted visitor records are locked by administration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50 p-5">
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                      <span className="text-sm text-slate-500 font-bold">Unpaid Visitors</span>
                      <span className="font-bold text-slate-900">{visitorCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 py-3">
                      <span className="text-sm text-slate-500 font-bold">Visitor Rate</span>
                      <span className="font-bold text-slate-900">KES 3.00</span>
                    </div>
                    <div className="flex items-end justify-between pt-3">
                      <span className="text-sm font-bold text-slate-500">Balance Due</span>
                      <span className="text-2xl font-black text-slate-900">
                        KES {amountDue > 0 ? amountDue.toLocaleString() : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button disabled className="w-full h-12 bg-slate-100 text-slate-500 font-bold rounded-[1rem]">
                      <AlertOctagon className="h-4 w-4 mr-2" />
                      Account Locked Manually
                    </Button>
                    <Button variant="outline" className="w-full h-12 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-[1rem]" asChild>
                      <Link href="/dashboard/company-admin/billing">View Payments</Link>
                    </Button>
                  </div>

                  <p className="text-center text-xs leading-5 text-slate-500">
                    Payments are currently managed manually. Please contact the Superadmin to unlock your account.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
