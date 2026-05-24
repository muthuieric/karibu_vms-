"use client";

import { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { Building2, CheckCircle2, Loader2, LogOut, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ConfirmedVisitor = {
  name: string;
  hostName?: string | null;
  checkedOutAt?: string | null;
};

function formatCheckoutTime(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

  const checkedOutTime = formatCheckoutTime(visitor?.checkedOutAt);

  return (
    <main className="flex w-full justify-center px-4 py-8">
      <Card className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>

          <CardDescription className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-700">
            Karibu VMS
          </CardDescription>

          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Host checkout confirmation
          </CardTitle>

          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
            Enter the visitor code after the guest reaches you to confirm the visit and check them out.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {visitor && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-800" role="status">
              <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
              <p className="mt-3 text-lg font-black">{visitor.name} checked out</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {visitor.hostName ? `Host: ${visitor.hostName}` : "Visit confirmed"}
                {checkedOutTime ? ` · ${checkedOutTime}` : ""}
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-800" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="host-confirm-code"
                className="mb-2 block text-center text-sm font-bold text-slate-700"
              >
                Enter visitor code
              </Label>

              <div className="relative">
                <UserCheck className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="host-confirm-code"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="h-14 rounded-xl border-slate-200 bg-slate-50 pl-11 text-center text-2xl font-bold tracking-widest text-slate-900 shadow-inner focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-14 w-full rounded-xl bg-blue-600 text-lg font-bold text-white hover:bg-blue-700"
              disabled={isLoading || code.trim().length < 4}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Confirming...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-5 w-5" aria-hidden="true" />
                  Confirm Visit / Check Out
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function HostConfirmWrapper() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="flex w-full items-center justify-center">
        <Suspense
          fallback={
            <div
              className="flex min-h-screen w-full items-center justify-center px-4"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
              <span className="sr-only">Loading visit confirmation...</span>
            </div>
          }
        >
          <HostConfirmContent />
        </Suspense>
      </div>
    </div>
  );
}
