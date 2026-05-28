"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VisitorPassCard, { type SafeVisitorPass } from "@/components/visitor/VisitorPassCard";

export default function VisitorPassPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [pass, setPass] = useState<SafeVisitorPass | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return undefined;

    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadPass = async () => {
      try {
        const response = await fetch(`/api/visitor-pass/${encodeURIComponent(token)}`, { cache: "no-store" });
        const result = await response.json().catch(() => ({}));

        if (!active) return;
        if (!response.ok) {
          setError(result.error || "Visitor pass could not be loaded.");
          return;
        }

        setPass(result.data);
        setError(null);

        const status = result.data.status as SafeVisitorPass["status"] | undefined;
        if (status === "pending" || status === "approved") {
          timeoutId = setTimeout(loadPass, status === "pending" ? 8000 : 15000);
        }
      } catch {
        if (active) {
          setError("Visitor pass could not be loaded.");
          timeoutId = setTimeout(loadPass, 15000);
        }
      }
    };

    loadPass();

    return () => {
      active = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [token]);

  const passUrl = typeof window !== "undefined" ? window.location.href : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-8">
      {pass ? (
        <VisitorPassCard pass={pass} passUrl={passUrl} />
      ) : (
        <div className="w-full max-w-md rounded-[1.5rem] border border-blue-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-slate-950">Karibu VMS</h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">{error || "Loading visitor pass..."}</p>
        </div>
      )}
    </main>
  );
}
