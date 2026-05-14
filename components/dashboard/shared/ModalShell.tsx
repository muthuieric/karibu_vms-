import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ModalShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  tone?: "default" | "danger";
};

export function ModalShell({
  title,
  description,
  children,
  onClose,
  className,
  tone = "default",
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">
      <div className={cn("relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[1.4rem] bg-white shadow-2xl border border-slate-100", className)}>
        <Button
          type="button"
          variant="ghost"
          className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 p-0"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="px-6 pt-6 pb-2 pr-14">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>}
        </div>
        <div className="p-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
