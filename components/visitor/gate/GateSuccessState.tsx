"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import VisitorPassCard, { type SafeVisitorPass } from "@/components/visitor/VisitorPassCard";

type GateSuccessStateProps = {
  companyName?: string;
  gateName?: string | null;
  visitorName?: string;
  hostName?: string | null;
  passUrl?: string | null;
  passToken?: string | null;
};

export default function GateSuccessState({
  companyName,
  gateName,
  visitorName,
  hostName,
  passUrl,
  passToken,
}: GateSuccessStateProps) {
  const [livePass, setLivePass] = useState<SafeVisitorPass | null>(null);

  useEffect(() => {
    if (!passToken) return undefined;

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadPass = async () => {
      try {
        const response = await fetch(`/api/visitor-pass/${encodeURIComponent(passToken)}`, { cache: "no-store" });
        const result = await response.json().catch(() => ({}));
        if (!active) return;
        if (response.ok && result.data) {
          setLivePass(result.data);
          if (result.data.status === "pending") {
            timeoutId = setTimeout(loadPass, 8000);
          }
        } else {
          timeoutId = setTimeout(loadPass, 15000);
        }
      } catch {
        // Keep the initial pending pass visible if polling briefly fails.
        if (active) timeoutId = setTimeout(loadPass, 15000);
      }
    };

    loadPass();

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [passToken]);

  if (passUrl) {
    return (
      <div className="relative z-10 flex w-full justify-center p-4">
        <VisitorPassCard
          pass={livePass || {
            visitorName: visitorName || "Visitor",
            hostName,
            companyName: companyName || "Karibu VMS",
            gateName,
            status: "pending",
            date: new Date().toISOString(),
            checkedInAt: null,
          }}
          passUrl={passUrl}
        />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex w-full justify-center p-4">
      <Card className="w-full max-w-md text-center p-8 bg-white">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-success/15 bg-success/10 text-success">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight mb-2">Registration Sent</CardTitle>
        <p className="text-text-muted font-medium leading-relaxed">
          Your details have been securely transmitted. <strong className="text-text-main">Please wait for the security guard to approve your entry.</strong>
        </p>
      </Card>
    </div>
  );
}
