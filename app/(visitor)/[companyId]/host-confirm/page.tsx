"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, CheckCircle2, Loader2, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ConfirmedVisitor = {
  name: string;
  hostName?: string | null;
  hostConfirmedAt?: string | null;
};

function PublicActionShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-zinc-50 p-4 font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900 sm:p-6 lg:p-8">
      <main className="w-full">{children}</main>
    </div>
  );
}

function LogoHeader({ subtitle }: { subtitle?: string }) {
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
      {subtitle ? <p className="text-sm font-semibold text-zinc-500">{subtitle}</p> : null}
    </div>
  );
}

function HostConfirmContent() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [code, setCode] = useState("");
  const [visitor, setVisitor] = useState<ConfirmedVisitor | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;

      try {
        const response = await fetch(`/api/public/company?company_id=${companyId}`);
        const result = await response.json().catch(() => ({}));
        const company = result.data;

        if (response.ok && company?.name) {
          setCompanyName(company.name);
        }
      } catch {
        setCompanyName("");
      }
    };

    fetchCompanyData();
  }, [companyId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const visitorCode = code.trim();
    if (!visitorCode) return;

    setErrorMsg("");
    setVisitor(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/host-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, code: visitorCode }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.visitor) {
        throw new Error(result.error || "Visit could not be confirmed.");
      }

      setVisitor(result.visitor);
      setCode("");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : "Visit could not be confirmed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl border-zinc-100 bg-white shadow-sm">
      <CardHeader className="pb-6 text-center">
        <LogoHeader subtitle={companyName || undefined} />

        <CardTitle className="text-3xl font-semibold tracking-tight text-zinc-950">Host confirmation</CardTitle>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Enter the visitor code after the guest reaches you so the visit can be marked as host-confirmed.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {visitor && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-800" role="status">
            <CheckCircle2 className="mx-auto h-9 w-9" aria-hidden="true" />
            <p className="mt-3 text-lg font-semibold">Visit confirmed</p>
            <p className="mt-1 text-sm font-medium text-emerald-700">
              {visitor.name ? `${visitor.name} has been confirmed by the host.` : "The visitor has been confirmed by the host."}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center text-sm font-medium leading-6 text-orange-800" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <Label htmlFor="host-confirm-code" className="text-sm font-medium text-zinc-700">
              Visitor code
            </Label>

            <div className="relative">
              <UserCheck className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <Input
                id="host-confirm-code"
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

          <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 text-base font-medium text-white transition-colors hover:bg-blue-700" disabled={isLoading || code.trim().length < 4}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                Confirming...
              </>
            ) : (
              <>
                <BadgeCheck className="mr-2 h-5 w-5" aria-hidden="true" />
                Confirm Visit
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function HostConfirmWrapper() {
  return (
    <PublicActionShell>
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
            <LogoHeader />
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
            <p className="font-semibold text-zinc-950">Loading visit confirmation...</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Please wait while we prepare the host confirmation form.</p>
          </div>
        }
      >
        <HostConfirmContent />
      </Suspense>
    </PublicActionShell>
  );
}
