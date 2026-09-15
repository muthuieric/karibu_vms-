"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Shield, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      window.location.reload();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 text-slate-800">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <WifiOff className="h-10 w-10 text-blue-600" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Offline Mode Active
        </span>

        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
          No Internet Connection
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          You are disconnected from the network. If you are a security guard or receptionist, your check-ins and walk-in registrations are cached locally and will sync automatically once reconnected.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 font-bold text-white hover:bg-blue-700 h-11"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Check Connection & Reload
          </Button>

          <Link href="/dashboard/guard" className="w-full">
            <Button
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-11"
            >
              <Shield className="mr-2 h-4 w-4" />
              Go to Guard Desk (Cached)
            </Button>
          </Link>

          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-slate-600 hover:bg-slate-100 h-11"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>

        {isOnline && (
          <p className="mt-4 text-xs font-medium text-emerald-600 animate-fade-in">
            Connection detected! Reloading page...
          </p>
        )}
      </div>
    </div>
  );
}

