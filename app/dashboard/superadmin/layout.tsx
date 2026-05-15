"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Banknote, CircuitBoard, Command, Factory, SlidersHorizontal } from "lucide-react";

import { DashboardSidebar, type DashboardNavItem } from "@/components/dashboard/shared/DashboardSidebar";
import { LoadingState } from "@/components/dashboard/shared/StateBlocks";
import { supabase } from "@/lib/supabase";

const superadminNavItems: DashboardNavItem[] = [
  { href: "/dashboard/superadmin", label: "Platform Home", icon: Command, exact: true },
  { href: "/dashboard/superadmin/companies", label: "Workspaces", icon: Factory },
  { href: "/dashboard/superadmin/billing", label: "Revenue", icon: Banknote },
  { href: "/dashboard/superadmin/transactions", label: "Payments", icon: CircuitBoard },
  { href: "/dashboard/superadmin/settings", label: "Platform Settings", icon: SlidersHorizontal },
];

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const verifySuperadmin = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (profile?.role === "superadmin" || profile?.role === "super_admin") {
          setIsAuthorized(true);
        } else {
          alert("Unauthorized access. Superadmin role required.");
          router.push("/login");
        }
      } else {
        router.push("/login");
      }
    };

    verifySuperadmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoadingState label="Verifying secure credentials..." />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      <DashboardSidebar
        brand="Karibu VMS"
        subtitle="Superadmin"
        pathname={pathname || ""}
        navItems={superadminNavItems}
        isMobileOpen={isMobileMenuOpen}
        onMobileOpenChange={setIsMobileMenuOpen}
        onLogout={handleLogout}
      />

      <main className="min-w-0 flex-1 overflow-y-auto bg-[#F8FAFC]">
        {children}
      </main>
    </div>
  );
}
