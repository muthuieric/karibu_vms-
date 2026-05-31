"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, Building2, CheckCircle2, Loader2, ShieldCheck, UserCheck } from "lucide-react";

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
            Host confirmation
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

function HostConfirmContent() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [code, setCode] = useState("");
  const [visitor, setVisitor] = useState<ConfirmedVisitor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    <Card className="mx-auto w-full max-w-md rounded-[2rem] border-blue-100 bg-white shadow-2xl shadow-blue-950/10">
      <CardHeader className="pb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <Building2 className="h-6 w-6" aria-hidden="true" />
        </div>

        <CardDescription className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
          Karibu VMS
        </CardDescription>

        <CardTitle className="text-2xl font-black tracking-tight text-zinc-950">Host confirmation</CardTitle>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500">
          Enter the visitor code after the guest reaches you so the visit can be marked as host-confirmed.
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {visitor && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-800" role="status">
            <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
            <p className="mt-3 text-lg font-black">Visit confirmed</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">
              {visitor.name ? `${visitor.name} has been confirmed by the host.` : "The visitor has been confirmed by the host."}
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-center text-sm font-semibold leading-6 text-orange-800" role="alert">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="host-confirm-code" className="mb-2 block text-center text-sm font-bold text-zinc-700">
              Enter visitor code
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
                className="h-14 rounded-xl border-zinc-200 bg-zinc-50 pl-11 text-center text-2xl font-black tracking-widest text-zinc-950 shadow-inner focus-visible:ring-2 focus-visible:ring-blue-500/20"
              />
            </div>
          </div>

          <Button type="submit" className="h-14 w-full rounded-xl bg-blue-600 text-lg font-black text-white hover:bg-blue-700" disabled={isLoading || code.trim().length < 4}>
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
          <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-[2rem] border border-blue-100 bg-white p-8 text-center shadow-2xl shadow-blue-950/10" role="status" aria-live="polite">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
            <p className="font-bold text-zinc-950">Loading visit confirmation...</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Please wait while we prepare the host confirmation form.</p>
          </div>
        }
      >
        <HostConfirmContent />
      </Suspense>
    </PublicActionShell>
  );
}
