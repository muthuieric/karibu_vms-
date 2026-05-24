"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertOctagon, CheckCircle2, KeyRound, Loader2, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
          <p className="font-medium text-text-muted">Loading checkout portal...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/15 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/10 text-destructive">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <CardTitle className="mb-2 text-2xl font-bold">System Unavailable</CardTitle>
          <CardDescription className="text-base">
            This building&apos;s self-service system is currently offline. Please speak directly to the security guard at the gate to check out.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 py-8">
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
            <LogOut className="h-6 w-6" />
          </div>
          <CardDescription className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
            {companyName}
          </CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight">Visitor checkout</CardTitle>
        </CardHeader>

        <CardContent>
          {successMsg && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-emerald-800" role="status">
              <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
              <p className="mt-3 text-base font-black">{successMsg}</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 rounded-xl border border-destructive/15 bg-destructive/10 p-3 text-center text-sm font-medium text-destructive" role="alert">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <Label htmlFor="checkout-code" className="mb-2 block text-center">
                Enter visitor code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                <Input
                  id="checkout-code"
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="h-14 pl-11 text-center text-2xl font-bold tracking-widest shadow-inner"
                />
              </div>
            </div>

            <Button type="submit" className="mt-6 h-14 w-full text-lg font-bold" disabled={isSubmitting || code.trim().length < 4}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Checking out...
                </>
              ) : (
                "Check Out Visitor"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
