"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertOctagon, BadgeCheck, CheckCircle2, KeyRound, Loader2, LogOut, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PublicActionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-blue-50 via-white to-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Karibu VMS home">
            <Image
              src="/logo.svg"
              alt="Karibu VMS visitor management system logo"
              width={120}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 sm:inline-flex">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Visitor self-service
          </div>
        </div>
      </header>

      <main className="relative flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 w-full">{children}</div>
      </main>
    </div>
  );
}

export default function PublicGateCheckOut() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;

      const companyResponse = await fetch(`/api/public/company?company_id=${companyId}`);
      const companyJson = await companyResponse.json();
      const company = companyJson.data;

      if (!companyResponse.ok || !company) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      setCompanyName(company.name);
      setLoading(false);
    };

    fetchCompanyData();
  }, [companyId]);

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    const visitorCode = code.trim();
    if (!visitorCode) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, code: visitorCode }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "No active visitor found with this code.");
      }

      setSuccessMsg(result.message || "Visitor checked out successfully.");
      setCode("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "No active visitor found with this code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicActionShell>
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-2xl shadow-blue-950/10" role="status" aria-live="polite">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
          <p className="font-bold text-zinc-950">Loading checkout portal...</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Please wait while we confirm the facility details.</p>
        </div>
      </PublicActionShell>
    );
  }

  if (accessDenied) {
    return (
      <PublicActionShell>
        <Card className="mx-auto w-full max-w-md rounded-[2rem] border-orange-200 bg-white p-4 text-center shadow-2xl shadow-blue-950/10">
          <CardContent className="pt-6">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-700">
              <AlertOctagon className="h-8 w-8" aria-hidden="true" />
            </div>
            <CardTitle className="mb-2 text-2xl font-black text-zinc-950">System unavailable</CardTitle>
            <CardDescription className="text-base leading-7 text-zinc-600">
              This building&apos;s self-service checkout is currently unavailable. Please speak directly to the security guard at the gate to check out.
            </CardDescription>
          </CardContent>
        </Card>
      </PublicActionShell>
    );
  }

  return (
    <PublicActionShell>
      <Card className="mx-auto w-full max-w-md rounded-[2rem] border-blue-100 bg-white shadow-2xl shadow-blue-950/10">
        <CardHeader className="pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
            <LogOut className="h-6 w-6" aria-hidden="true" />
          </div>
          <CardDescription className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            {companyName || "Karibu VMS"}
          </CardDescription>
          <CardTitle className="text-2xl font-black tracking-tight text-zinc-950">Visitor checkout</CardTitle>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Enter your visitor code to close your active visit and update the security record.
          </p>
        </CardHeader>

        <CardContent>
          {successMsg && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-800" role="status">
              <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
              <p className="mt-3 text-base font-black">{successMsg}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">Thank you. Your visit record has been closed.</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center text-sm font-semibold leading-6 text-orange-800" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <Label htmlFor="checkout-code" className="mb-2 block text-center text-sm font-bold text-zinc-700">
                Enter visitor code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                <Input
                  id="checkout-code"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="h-14 rounded-xl border-zinc-200 bg-zinc-50 pl-11 text-center text-2xl font-black tracking-widest text-zinc-950 shadow-inner focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            <Button type="submit" className="mt-6 h-14 w-full rounded-xl bg-blue-600 text-lg font-black text-white hover:bg-blue-700" disabled={isSubmitting || code.trim().length < 4}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Checking out...
                </>
              ) : (
                <>
                  <BadgeCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                  Check Out Visitor
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PublicActionShell>
  );
}
