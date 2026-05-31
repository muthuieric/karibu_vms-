"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertOctagon, BadgeCheck, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function PublicActionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-zinc-50 p-4 font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900 sm:p-6 lg:p-8">
      <main className="w-full">{children}</main>
    </div>
  );
}

function LogoHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="mb-8 text-center">
      <Image
        src="/logo.svg"
        alt="Karibu VMS logo"
        width={140}
        height={46}
        className="mx-auto mb-6 h-11 w-auto object-contain"
        priority
      />
      <p className="text-sm font-semibold text-zinc-500">{subtitle}</p>
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
        <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
          <LogoHeader subtitle="Visitor checkout" />
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <p className="font-semibold text-zinc-950">Loading checkout portal...</p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Please wait while we confirm the facility details.</p>
        </div>
      </PublicActionShell>
    );
  }

  if (accessDenied) {
    return (
      <PublicActionShell>
        <Card className="mx-auto w-full max-w-md rounded-3xl border-zinc-100 bg-white p-4 text-center shadow-sm">
          <CardContent className="pt-6">
            <LogoHeader subtitle="Visitor checkout" />
            <AlertOctagon className="mx-auto mb-4 h-9 w-9 text-orange-600" aria-hidden="true" />
            <CardTitle className="mb-2 text-2xl font-semibold tracking-tight text-zinc-950">System unavailable</CardTitle>
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
      <Card className="mx-auto w-full max-w-md rounded-3xl border-zinc-100 bg-white shadow-sm">
        <CardHeader className="pb-6 text-center">
          <LogoHeader subtitle={companyName || "Karibu VMS"} />
          <CardTitle className="text-3xl font-semibold tracking-tight text-zinc-950">Visitor checkout</CardTitle>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
            Enter your visitor code to close your active visit and update the security record.
          </p>
        </CardHeader>

        <CardContent>
          {successMsg && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-800" role="status">
              <CheckCircle2 className="mx-auto h-9 w-9" aria-hidden="true" />
              <p className="mt-3 text-base font-semibold">{successMsg}</p>
              <p className="mt-1 text-sm font-medium text-emerald-700">Thank you. Your visit record has been closed.</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-center text-sm font-medium leading-6 text-orange-800" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-5">
            <div className="space-y-2 text-left">
              <Label htmlFor="checkout-code" className="text-sm font-medium text-zinc-700">
                Visitor code
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
                  className="h-12 rounded-xl border-zinc-200 bg-zinc-50 pl-11 text-center text-xl font-semibold tracking-widest text-zinc-900 transition-colors focus:border-blue-500 focus:bg-white focus:ring-blue-500/20"
                />
              </div>
            </div>

            <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 text-base font-medium text-white transition-colors hover:bg-blue-700" disabled={isSubmitting || code.trim().length < 4}>
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
