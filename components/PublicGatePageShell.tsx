"use client";

import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type PublicGatePageShellProps = {
  children: ReactNode;
};

export default function PublicGatePageShell({ children }: PublicGatePageShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F8FAFC] p-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_28rem),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.14),transparent_24rem)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.4),rgba(248,250,252,0.96))]" />
      <Suspense
        fallback={
          <div className="z-10 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
