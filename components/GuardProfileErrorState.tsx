"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuardProfileErrorStateProps = {
  title?: string;
  message?: string;
};

export default function GuardProfileErrorState({
  title = "Access Error",
  message = "We could not load your guard profile. Please contact your administrator.",
}: GuardProfileErrorStateProps) {
  const backToLogin = async () => {
    window.location.href = "/login?next=/dashboard/guard";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500">{message}</p>
        <Button onClick={backToLogin} className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700">
          Back to Login
        </Button>
      </div>
    </div>
  );
}
