import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
  {
    variants: {
      variant: {
        default: "border-indigo-100 bg-indigo-50 text-indigo-700",
        secondary: "border-slate-200 bg-slate-50 text-slate-700",
        success: "border-emerald-100 bg-emerald-50 text-emerald-700",
        pending: "border-amber-100 bg-amber-50 text-amber-700",
        error: "border-rose-100 bg-rose-50 text-rose-700",
        info: "border-sky-100 bg-sky-50 text-sky-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
