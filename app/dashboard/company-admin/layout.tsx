"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertOctagon,
  Blocks,
  CreditCard,
  Gauge,
  LifeBuoy,
  PanelsTopLeft,
  ScanLine,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { AppSurface } from "@/components/dashboard/shared/AppShell";
import { DashboardSidebar, type DashboardNavItem } from "@/components/dashboard/shared/DashboardSidebar";
import { LockedAccountBanner } from "@/components/dashboard/shared/LockedAccountBanner";
import { LoadingState } from "@/components/dashboard/shared/StateBlocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const adminNavItems: DashboardNavItem[] = [
  { href: "/dashboard/company-admin", label: "Overview", icon: Gauge, exact: true },
  { href: "/dashboard/company-admin/qr", label: "Gate QR Code", icon: ScanLine },
  { href: "/dashboard/company-admin/guards", label: "Security Team", icon: ShieldCheck },
  { href: "/dashboard/company-admin/rules", label: "Building Rules", icon: PanelsTopLeft },
  { href: "/dashboard/company-admin/departments", label: "Departments", icon: Blocks },
  { href: "/dashboard/company-admin/blacklist", label: "Blacklist", icon: AlertOctagon, danger: true },
  { href: "/dashboard/company-admin/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/company-admin/support", label: "Help Desk", icon: LifeBuoy },
  { href: "/dashboard/company-admin/settings", label: "Settings", icon: Settings },
];

export default function CompanyAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLocked, setIsLocked] = useState<boolean>(false);
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
              .select("is_locked, created_at")
              .eq("id", profile.company_id)
              .single();

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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoadingState label="Verifying admin access..." />
      </div>
    );
  }

  const safePathname = pathname || "";
  const normalizedPath = safePathname.endsWith("/") ? safePathname.slice(0, -1) : safePathname;
  const isPaymentSuccessPage = normalizedPath.includes("/payment-success");
  const isExactAdminPage = normalizedPath === "/dashboard/company-admin";
  const isDepartmentsPage = normalizedPath.includes("/departments");
  const isBlacklistPage = normalizedPath.includes("/blacklist");
  const isRestrictedRoute = isExactAdminPage || isDepartmentsPage || isBlacklistPage;
  const showLockdownPopup = isLocked && isRestrictedRoute && !isPaymentSuccessPage;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      <DashboardSidebar
        brand="Karibu VMS"
        subtitle="Admin Dashboard"
        pathname={normalizedPath}
        navItems={adminNavItems}
        isMobileOpen={isMobileMenuOpen}
        onMobileOpenChange={setIsMobileMenuOpen}
        onLogout={handleLogout}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {isLocked && !isPaymentSuccessPage && (
          <LockedAccountBanner
            title="Account locked"
            message="Your account has been locked manually by administration."
          />
        )}

        <AppSurface className="flex-1 overflow-y-auto" variant="admin">
          {showLockdownPopup ? (
            <div className="flex min-h-full items-center justify-center bg-background p-4 sm:p-6">
              <Card className="w-full max-w-md border-destructive/20">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/10 text-destructive">
                    <AlertOctagon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl">Access Restricted</CardTitle>
                  <CardDescription>
                    Management logs, departments, and blacklists are locked by administration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-2xl border border-border bg-surface-muted p-5">
                    <div className="flex justify-between border-b border-border pb-3">
                      <span className="text-sm text-text-muted">Unpaid Visitors</span>
                      <span className="font-bold text-text-main">{visitorCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-border py-3">
                      <span className="text-sm text-text-muted">Rate per Visitor</span>
                      <span className="font-bold text-text-main">KES 3.00</span>
                    </div>
                    <div className="flex items-end justify-between pt-3">
                      <span className="text-sm font-semibold text-text-muted">Total Amount Due</span>
                      <span className="text-2xl font-bold text-text-main">
                        KES {amountDue > 0 ? amountDue.toLocaleString() : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button disabled className="w-full">
                      <AlertOctagon className="h-4 w-4" />
                      Account Locked Manually
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/dashboard/company-admin/billing">View Billing History</Link>
                    </Button>
                  </div>

                  <p className="text-center text-xs leading-5 text-text-muted">
                    Payments are currently managed manually. Please contact the Superadmin to unlock your account.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            children
          )}
        </AppSurface>
      </main>
    </div>
  );
}
