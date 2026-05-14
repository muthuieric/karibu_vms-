"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, RefreshCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("Connecting to PesaPal to verify your transaction...");

  const verifyPayment = useCallback(async () => {
    setStatus("loading");
    setMessage("Connecting to PesaPal to verify your transaction...");

    // PesaPal appends these to the URL when it redirects the user back
    const orderTrackingId = searchParams.get("OrderTrackingId");
    const orderMerchantReference = searchParams.get("OrderMerchantReference");

    if (!orderTrackingId || !orderMerchantReference) {
      setStatus("failed");
      setMessage("Invalid payment redirect. Missing tracking parameters.");
      return;
    }

    try {
      // FIX: Added `nocache=${Date.now()}` to force Next.js to completely bypass any caching 
      // and actually hit your database to unlock the account!
      const res = await fetch(`/api/payments/pesapal/verify?OrderTrackingId=${orderTrackingId}&OrderMerchantReference=${orderMerchantReference}&nocache=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Payment verified! Your account has been securely unlocked.");
        // We removed the auto-redirect here so you can actually read the success message!
      } else {
        setStatus("failed");
        // Display the exact error from the backend if available
        setMessage(`Verification failed: ${data.status || data.error || "Please contact support."}`);
      }
    } catch {
      setStatus("failed");
      setMessage("A network error occurred while verifying the payment.");
    }
  }, [searchParams]);

  useEffect(() => {
    queueMicrotask(() => {
      void verifyPayment();
    });
  }, [verifyPayment]);

  return (
    <Card className="max-w-md w-full text-center">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border">
          {status === "loading" && <Loader2 className="w-10 h-10 text-warning-foreground animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-10 h-10 text-success" />}
          {status === "failed" && <XCircle className="w-10 h-10 text-destructive" />}
        </div>
        <CardTitle className="text-2xl font-bold">
          {status === "loading" ? "Verifying Payment..." : status === "success" ? "Payment Successful" : "Verification Failed"}
        </CardTitle>
        <CardDescription className="mt-2 text-base">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <div className="mt-6">
            <Button 
              onClick={() => window.location.href = "/dashboard/company-admin"} 
              className="w-full flex items-center justify-center gap-2 bg-success hover:bg-success/90 text-white"
            >
              Continue to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        {status === "failed" && (
          <div className="space-y-3 mt-6">
            <Button 
              onClick={verifyPayment} 
              className="bg-warning hover:bg-warning/90 text-white w-full flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" /> Try Verifying Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/dashboard/company-admin"} 
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Suspense fallback={
        <Card className="max-w-md w-full p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        </Card>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
