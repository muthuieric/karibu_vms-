import type { ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <Card className={cn("relative max-h-[92vh] w-full max-w-lg overflow-y-auto", className)}>
        <div className={cn("absolute inset-x-0 top-0 h-1", tone === "danger" ? "bg-destructive" : "bg-primary")} />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-4 top-4"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="pr-14 pt-7">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
