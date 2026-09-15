"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
    <div className="flex min-h-screen flex-col items-center justify-between bg-[#F8FAFC] px-4 py-8">
      <main className="flex w-full flex-1 items-center justify-center">
        {pass ? (
          <VisitorPassCard pass={pass} passUrl={passUrl} />
        ) : (
          <div className="w-full max-w-md rounded-[1.5rem] border border-blue-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black text-slate-950">Karibu VMS</h1>
            <p className="mt-3 text-sm font-semibold text-slate-500">{error || "Loading visitor pass..."}</p>
          </div>
        )}
      </main>
      <footer className="mt-8 pb-2 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
        <span>Powered by</span>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-blue-600 transition-colors"
          title="Karibu Visitor Management System"
        >
          <Image src="/icon.svg" width={16} height={16} alt="Karibu VMS" className="h-4 w-4 object-contain" />
          <span>Karibu VMS</span>
        </Link>
      </footer>
    </div>
  );
}
