"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HardLockedScreen } from "@/components/dashboard/shared/HardLockedScreen";
import { LockedAccountBanner } from "@/components/dashboard/shared/LockedAccountBanner";
import { LoadingState } from "@/components/dashboard/shared/StateBlocks";

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isHardLocked, setIsHardLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyHostAccess = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
          router.replace("/login");
          return;
        }

        let { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, company_id")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (!profile) {
          try {
            const syncRes = await fetch("/api/auth/profile-sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: authData.user.id }),
            });
            if (syncRes.ok) {
              const syncData = await syncRes.json();
              if (syncData.profile) {
                profile = syncData.profile;
              }
            }
          } catch {
            // Ignore
          }
        }

        if (!profile && authData.user.user_metadata?.role) {
          profile = {
            role: authData.user.user_metadata.role,
            company_id: authData.user.user_metadata.companyId || authData.user.user_metadata.company_id || null,
          };
        }

        if (!profile) {
          router.replace("/login");
          return;
        }

        const role = (profile.role || "").toLowerCase();
        if (role !== "host" && role !== "company_admin" && role !== "superadmin") {
          router.replace("/login");
          return;
        }

        if (profile.company_id) {
          const { data: company } = await supabase
            .from("companies")
            .select("is_locked, hard_locked, subscription_ends_at")
            .eq("id", profile.company_id)
            .maybeSingle();

          if (company) {
            if (company.hard_locked) {
              setIsHardLocked(true);
              setLoading(false);
              return;
            }

            const isExpired = company.subscription_ends_at
              ? new Date(company.subscription_ends_at) < new Date()
              : false;
            if (company.is_locked || isExpired) {
              setIsLocked(true);
            }
          }
        }
      } catch (err) {
        console.error("Host layout verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyHostAccess();
  }, [router]);

  const handleBackToLogin = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <LoadingState label="Loading Host Portal..." />
      </div>
    );
  }

  if (isHardLocked) {
    return <HardLockedScreen onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {isLocked && <LockedAccountBanner message="Organization subscription is expired. Please contact your company administrator." />}
      {children}
    </div>
  );
}

