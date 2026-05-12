"use client";

import { CheckCircle2, Clock, Receipt, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Transaction = {
  id: string;
  created_at: string;
  amount: number;
  tracking_id: string;
  status: string;
};

type PaymentHistoryCardProps = {
  transactions: Transaction[];
  formatDate: (date: Date | string) => string;
};

export default function PaymentHistoryCard({ transactions, formatDate }: PaymentHistoryCardProps) {
  return (
    <Card className="shadow-lg border-0 ring-1 ring-zinc-200">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50/50 pb-5">
        <CardTitle className="text-lg">Payment History</CardTitle>
        <CardDescription>A complete chronological log of your past top-ups and settlements.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">No Transactions Yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm mt-1">
              When you make your first payment for visitor check-ins, the receipt will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50/80">
                <TableRow className="border-zinc-200">
                  <TableHead className="font-semibold text-zinc-600">Date & Time</TableHead>
                  <TableHead className="font-semibold text-zinc-600">Reference ID</TableHead>
                  <TableHead className="font-semibold text-zinc-600 text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-zinc-600 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const statusUpper = tx.status?.toUpperCase() || "PENDING";
                  let StatusIcon = Clock;
                  let statusColor = "text-amber-700 bg-amber-50 ring-amber-200";

                  if (statusUpper === "COMPLETED" || statusUpper === "SUCCESS" || statusUpper === "PAID") {
                    StatusIcon = CheckCircle2;
                    statusColor = "text-green-700 bg-green-50 ring-green-200";
                  } else if (statusUpper === "FAILED" || statusUpper === "CANCELLED") {
                    StatusIcon = XCircle;
                    statusColor = "text-red-700 bg-red-50 ring-red-200";
                  }

                  return (
                    <TableRow key={tx.id} className="hover:bg-zinc-50/80 transition-colors border-zinc-100">
                      <TableCell className="whitespace-nowrap">
                        <div className="font-medium text-zinc-900">
                          {formatDate(tx.created_at)}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          {new Date(tx.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500">
                        {tx.tracking_id || "—"}
                      </TableCell>
                      <TableCell className="font-bold text-zinc-900 whitespace-nowrap text-right">
                        KES {Number(tx.amount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset ${statusColor} whitespace-nowrap`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {tx.status || "PENDING"}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
