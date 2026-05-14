import Image from "next/image";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QRDisplayCardProps = {
  title: string;
  description: string;
  qrUrl: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  tone?: "primary" | "warning";
  printClassName?: string;
};

export function QRDisplayCard({
  title,
  description,
  qrUrl,
  icon: Icon,
  footer,
  tone = "primary",
  printClassName,
}: QRDisplayCardProps) {
  const color =
    tone === "warning"
      ? "from-orange-500 to-amber-400 text-orange-700 bg-orange-50 border-orange-100"
      : "from-blue-600 to-sky-500 text-blue-700 bg-blue-50 border-blue-100";

  return (
    <Card className={cn("overflow-hidden", printClassName)}>
      <div className={cn("h-2 bg-gradient-to-r", color.split(" ").slice(0, 2).join(" "))} />
      <CardHeader className="items-center text-center">
        {Icon && (
          <div className={cn("mb-2 rounded-2xl border p-3", color.split(" ").slice(2).join(" "))}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <CardTitle className="text-2xl font-black uppercase tracking-tight">{title}</CardTitle>
        <CardDescription className="max-w-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 pb-6">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
          <Image src={qrUrl} alt={title} width={190} height={190} unoptimized className="h-48 w-48 rounded-xl object-contain" />
        </div>
        {footer}
      </CardContent>
    </Card>
  );
}
