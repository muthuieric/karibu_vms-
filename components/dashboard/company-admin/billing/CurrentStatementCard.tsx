"use client";

import { Activity, Calendar, CheckCircle2, CreditCard, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CurrentStatementCardProps = {
  amountDue: number;
  visitorCount: number;
  periodStart: Date | null;
  isPaying: boolean;
  formatDate: (date: Date | string) => string;
  onPayment: () => void;
};

export default function CurrentStatementCard({
  amountDue,
  visitorCount,
  periodStart,
  isPaying,
  formatDate,
  onPayment,
}: CurrentStatementCardProps) {
  return (
    <Card className="shadow-lg border-0 ring-1 ring-zinc-200 h-fit overflow-hidden">
      <div className={`h-1.5 w-full ${amountDue > 0 ? "bg-amber-500" : "bg-green-500"}`} />
      <CardHeader className="pb-4 bg-zinc-50/80 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="w-5 h-5 text-zinc-600" />
            Current Statement
          </CardTitle>
          {amountDue > 0 ? (
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              <Activity className="w-3.5 h-3.5" /> Due
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Settled
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 bg-white">
        <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-zinc-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Period Start</span>
          </div>
          <span className="font-semibold text-zinc-900">
            {periodStart ? formatDate(periodStart) : "N/A"}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500 font-medium">Unpaid Visitors</span>
            <span className="text-zinc-900 font-bold text-base">{visitorCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500 font-medium">Rate per Visitor</span>
            <span className="text-zinc-900 font-bold text-base">KES 3.00</span>
          </div>

          <div className="pt-4 border-t border-dashed border-zinc-200">
            <div className="flex justify-between items-end">
              <span className="text-zinc-900 font-bold">Total Due</span>
              <span className={`text-3xl font-black tracking-tight ${amountDue > 0 ? "text-amber-600" : "text-green-600"}`}>
                KES {amountDue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={onPayment}
          disabled={isPaying || amountDue <= 0}
          className={`w-full font-bold h-12 shadow-md transition-all active:scale-[0.98] ${
            amountDue > 0
              ? "bg-zinc-900 hover:bg-zinc-800 text-white"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {isPaying ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Securely...</>
          ) : amountDue <= 0 ? (
            <><CheckCircle2 className="w-5 h-5 mr-2" /> Account Settled</>
          ) : (
            <><CreditCard className="w-5 h-5 mr-2" /> Pay KES {amountDue.toLocaleString()}</>
          )}
        </Button>

        {amountDue <= 0 && (
          <div className="text-center">
            <p className="text-sm text-green-600 font-semibold mt-2">
              Your account is fully active!
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              No action required until new visitors arrive.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
