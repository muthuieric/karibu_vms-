"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LockedAccountBanner } from "@/components/dashboard/shared/LockedAccountBanner";
import { LoadingState } from "@/components/dashboard/shared/StateBlocks";

export default function GuardLayout({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyGuardAccess = async () => {
      const { data: authData } = await supabase.auth.getUser();
      
      if (authData?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", authData.user.id)
          .single();

        if (profile?.company_id) {
          const { data: company } = await supabase
            .from("companies")
            .select("is_locked, subscription_ends_at")
            .eq("id", profile.company_id)
            .single();

          if (company) {
            const isExpired = company.subscription_ends_at 
              ? new Date(company.subscription_ends_at) < new Date() 
              : false; 
            if (company.is_locked || isExpired) {
              setIsLocked(true);
            }
          }
        }
      }
      setLoading(false);
    };

    verifyGuardAccess();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <LoadingState label="Loading guard dashboard..." />
      </div>
    );
  }

  // SOFT LOCKOUT: Show a banner but still render the system
  if (isLocked) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <LockedAccountBanner message="System unpaid. Please contact administration." />
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
