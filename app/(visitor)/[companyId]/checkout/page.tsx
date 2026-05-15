"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertOctagon, CheckCircle2, LogOut, KeyRound } from "lucide-react";

type CheckoutVisitor = {
  name: string;
  phone?: string | null;
  photo_url?: string | null;
  created_at?: string | null;
};

export default function PublicGateCheckOut() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Form State
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // 2-Step State
  const [visitorDetails, setVisitorDetails] = useState<CheckoutVisitor | null>(null);
  const [checkedOutName, setCheckedOutName] = useState<string | null>(null);

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

  // --- Step 1: Search for the visitor using their OTP code ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/visitors/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, otp: otp.trim(), action: 'verify' }) // ACTION = VERIFY
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to find visit.");
      }

      // Success! Show details on screen.
      setVisitorDetails(result.visitor);

    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to find visit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Step 2: Actually check them out ---
  const handleCheckout = async () => {
    if (!visitorDetails) return;
    
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/visitors/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, otp: otp.trim(), action: 'checkout' }) // ACTION = CHECKOUT
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to check out.");
      }

      // Success! Show goodbye screen.
      setCheckedOutName(result.visitorName || visitorDetails.name);

    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to check out.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="text-text-muted font-medium">Loading checkout portal...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/15 text-center p-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/10 text-destructive">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold mb-2">System Unavailable</CardTitle>
          <CardDescription className="text-base">
            This building&apos;s self-service system is currently offline. Please speak directly to the security guard at the gate to check out.
          </CardDescription>
        </Card>
      </div>
    );
  }

  // --- View 3: Goodbye Screen (After Checkout) ---
  if (checkedOutName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8 relative overflow-hidden">
        <Card className="max-w-md w-full text-center p-8 z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-success/15 bg-success/10 text-success">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight mb-2">Goodbye, {checkedOutName.split(' ')[0]}!</CardTitle>
          <p className="text-text-muted font-medium leading-relaxed">
            You have successfully checked out of <strong className="text-text-main">{companyName}</strong>. Safe travels!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-8 flex items-center justify-center relative overflow-hidden">
      
      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-14 h-14 bg-primary/10 text-primary rounded-2xl border border-primary/15 flex items-center justify-center mb-4">
            <LogOut className="w-6 h-6 ml-1" />
          </div>
          <CardDescription className="uppercase tracking-widest font-bold text-xs text-primary mb-1">{companyName}</CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight">Visitor Check-Out</CardTitle>
          <p className="text-sm text-text-muted mt-2">Enter the gate code you received upon entry.</p>
        </CardHeader>
        
        <CardContent>
          {!visitorDetails ? (
            // --- View 1: Search Form ---
            <form onSubmit={handleSearch} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/15 text-center mb-4">
                  {errorMsg}
                </div>
              )}

              <div>
                <Label htmlFor="checkout-otp" className="mb-2 block text-center">Your 4-Digit Exit Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                  <Input 
                    id="checkout-otp"
                    required 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="e.g. 8492" 
                    className="h-14 pl-11 text-2xl tracking-widest text-center font-bold shadow-inner" 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6 h-14 text-lg font-bold" disabled={isSubmitting || !otp.trim()}>
                {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin"/> Locating Visit...</> : "Verify Code"}
              </Button>
            </form>
          ) : (
            // --- View 2: Confirm Details & Checkout ---
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-surface-muted border border-border p-5 rounded-2xl space-y-3 shadow-sm">
                
                {/* Image display if available */}
                {visitorDetails.photo_url && (
                  <div className="flex justify-center mb-4">
                    <Image src={visitorDetails.photo_url} alt="Visitor" width={80} height={80} unoptimized className="w-20 h-20 rounded-full object-cover border-2 border-border shadow-sm" />
                  </div>
                )}

                <div className="flex justify-between border-b border-border pb-2">
                  <span className="text-text-muted text-sm font-semibold uppercase tracking-wider">Name</span>
                  <span className="font-bold text-text-main">{visitorDetails.name}</span>
                </div>
                {visitorDetails.phone && (
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-text-muted text-sm font-semibold uppercase tracking-wider">Phone</span>
                    <span className="font-bold text-text-main">{visitorDetails.phone}</span>
                  </div>
                )}
                <div className="flex justify-between pb-1">
                  <span className="text-text-muted text-sm font-semibold uppercase tracking-wider">Arrived At</span>
                  <span className="font-bold text-primary">
                    {visitorDetails.created_at ? new Date(visitorDetails.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm font-medium rounded-xl border border-destructive/15 text-center">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={handleCheckout} 
                  className="w-full h-14 text-lg font-bold bg-destructive hover:bg-destructive/90 text-white" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing...</> : "Confirm & Sign Out"}
                </Button>
                <Button 
                  onClick={() => { setVisitorDetails(null); setOtp(""); }} 
                  variant="outline" 
                  className="w-full h-12 font-bold"
                  disabled={isSubmitting}
                >
                  Not Me? Try Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
