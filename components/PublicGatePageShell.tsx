"use client";

import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type PublicGatePageShellProps = {
  children: ReactNode;
};

export default function PublicGatePageShell({ children }: PublicGatePageShellProps) {
  return (
    <div className="relative flex flex-col min-h-screen items-center justify-between bg-slate-50 p-4 sm:p-6 py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-50/50 blur-[100px]" />
      </div>

      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10">
        <Suspense
          fallback={
            <div className="z-10 flex flex-col items-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
            </div>
          }
        >
          {children}
        </Suspense>
      </div>

     
    </div>
  );
}
