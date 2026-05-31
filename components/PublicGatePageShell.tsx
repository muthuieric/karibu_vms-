"use client";

import { Suspense, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

export default function PublicGatePageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-zinc-50 p-4 font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900 sm:p-6 lg:p-8">
      <main className="w-full">
        <Suspense
          fallback={
            <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
              <p className="font-semibold text-zinc-950">Loading visitor check-in...</p>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Please wait while we prepare this gate form.</p>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
