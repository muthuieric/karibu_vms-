import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "min-h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-base text-slate-900 shadow-sm transition-all duration-200 ease-in-out outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-70 aria-invalid:border-rose-500 aria-invalid:ring-2 aria-invalid:ring-rose-500/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
