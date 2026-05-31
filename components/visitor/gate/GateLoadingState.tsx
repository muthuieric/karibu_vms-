"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function GateLoadingState() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-zinc-100 bg-white p-8 text-center shadow-sm" role="status" aria-live="polite">
      <Image
        src="/logo.svg"
        alt="Karibu VMS logo"
        width={140}
        height={46}
        className="mx-auto mb-6 h-11 w-auto object-contain"
        priority
      />
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
      <p className="font-semibold text-zinc-950">Loading building rules...</p>
      <p className="mt-2 text-sm leading-6 text-zinc-500">Please wait while we prepare this visitor registration form.</p>
    </div>
  );
}
