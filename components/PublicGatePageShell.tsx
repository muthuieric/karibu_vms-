"use client";

import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type PublicGatePageShellProps = {
  children: ReactNode;
};

export default function PublicGatePageShell({ children }: PublicGatePageShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50 p-4 py-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-amber-400/20 blur-[100px] pointer-events-none" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center z-10">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
