"use client";

import { Calendar, CheckCircle2, Loader2, Receipt, WalletCards } from "lucide-react";
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
    <Card className="shadow-sm border-slate-100 rounded-[1.4rem] h-fit overflow-hidden bg-white">
      <CardHeader className="pb-4 bg-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Receipt className="w-5 h-5 text-slate-500" />
            Payment Summary
          </CardTitle>
          {amountDue > 0 ? (
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Settled
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <Calendar className="w-4 h-4" />
            <span>Period Start</span>
          </div>
          <span className="font-bold text-slate-900">
            {periodStart ? formatDate(periodStart) : "N/A"}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-bold">Visitor Count</span>
            <span className="text-slate-900 font-bold text-base">{visitorCount}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-bold">Visitor Rate</span>
            <span className="text-slate-900 font-bold text-base">KES 3.00</span>
          </div>

          <div className="pt-4">
            <div className="flex justify-between items-end">
              <span className="text-slate-900 font-bold">Current Balance</span>
              <span className={`text-3xl font-black tracking-tight ${amountDue > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                KES {amountDue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={onPayment}
          disabled={isPaying || amountDue <= 0}
          className={`w-full font-bold h-12 shadow-sm rounded-xl transition-all active:scale-[0.98] ${
            amountDue > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isPaying ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
          ) : amountDue <= 0 ? (
            <><CheckCircle2 className="w-5 h-5 mr-2" /> Account Settled</>
          ) : (
            <><WalletCards className="w-5 h-5 mr-2" /> Pay KES {amountDue.toLocaleString()}</>
          )}
        </Button>

        {amountDue <= 0 && (
          <div className="text-center">
            <p className="text-sm text-emerald-600 font-bold mt-2">
              Your account is fully active!
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1">
              No action required until new visitors arrive.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
