"use client";

import Image from "next/image";
import { Info, Search, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Visitor = {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "checked_in" | "checked_out" | "auto_checked_out";
  created_at: string;
  checked_in_at?: string;
  document_type: string;
  id_number?: string;
  otp_code?: string;
  company_id: string;
  photo_url?: string;
  host_name?: string;
  host_confirmed?: boolean;
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>;
  gate_id?: string | null;
};

type GuardVisitorsTableProps = {
  loading: boolean;
  visitors: Visitor[];
  searchTerm: string;
  statusFilter: "all" | "pending" | "checked_in";
  verifyingId: string | null;
  sendingOtpId: string | null;
  otpInput: string;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "pending" | "checked_in") => void;
  onPhotoClick: (url: string) => void;
  onInfoClick: (visitor: Visitor) => void;
  onOtpInputChange: (value: string) => void;
  onConfirmOTP: (visitor: Visitor) => void;
  onCancelOTP: () => void;
  onSendOTP: (id: string, phone: string) => void;
  onCheckOut: (id: string) => void;
};

export default function GuardVisitorsTable({
  loading,
  visitors,
  searchTerm,
  statusFilter,
  verifyingId,
  sendingOtpId,
  otpInput,
  onSearchTermChange,
  onStatusFilterChange,
  onPhotoClick,
  onInfoClick,
  onOtpInputChange,
  onConfirmOTP,
  onCancelOTP,
  onSendOTP,
  onCheckOut,
}: GuardVisitorsTableProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
      <CardHeader className="flex flex-col gap-4 border-b border-zinc-100/50 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <CardTitle>Today&apos;s Active Visitors</CardTitle>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search..."
                className="pl-9 w-full bg-white/80"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
            </div>

            <div className="flex w-full sm:w-auto bg-zinc-100/80 p-1 rounded-md border border-zinc-200/60 overflow-x-auto">
              <button
                onClick={() => onStatusFilterChange("all")}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${statusFilter === "all" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                All
              </button>
              <button
                onClick={() => onStatusFilterChange("pending")}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${statusFilter === "pending" ? "bg-white shadow-sm text-amber-700" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                Pending
              </button>
              <button
                onClick={() => onStatusFilterChange("checked_in")}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${statusFilter === "checked_in" ? "bg-white shadow-sm text-green-700" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                Checked In
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-zinc-500 py-4">Loading secure data...</p>
        ) : visitors.length === 0 ? (
          <p className="text-zinc-500 py-4">No active visitors match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200/50">
                  <TableHead>Arrived</TableHead>
                  <TableHead>Visitor Details</TableHead>
                  <TableHead>Phone & ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => {
                  const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                  const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;

                  return (
                    <TableRow key={visitor.id} className="border-zinc-200/50 hover:bg-zinc-50/50">
                      <TableCell className="font-medium text-zinc-500 whitespace-nowrap">
                        {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {visitor.photo_url ? (
                            <Image
                              src={visitor.photo_url}
                              alt={`${visitor.name}'s photo`}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border-2 border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity bg-white shrink-0"
                              onClick={() => onPhotoClick(visitor.photo_url!)}
                              unoptimized
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border-2 border-zinc-200 text-zinc-400 shrink-0">
                              <UserCircle className="w-6 h-6" />
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <span className="font-semibold whitespace-nowrap">{visitor.name}</span>

                            {hasExtraInfo && (
                              <button
                                onClick={() => onInfoClick(visitor)}
                                className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-full transition-colors shrink-0 shadow-sm border border-blue-100"
                                title="View Visit Info"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm whitespace-nowrap">{visitor.phone || "—"}</div>
                        <div className="text-xs text-zinc-500 whitespace-nowrap">{visitor.id_number || "No ID"}</div>
                      </TableCell>

                      <TableCell>
                        {visitor.status === "pending" ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800 whitespace-nowrap border border-amber-200/50">Pending</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100/80 px-2.5 py-0.5 text-xs font-semibold text-green-800 whitespace-nowrap border border-green-200/50">Checked In</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {visitor.status === "pending" ? (
                          verifyingId === visitor.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="OTP"
                                className="w-16 rounded border px-2 py-1 text-center text-sm bg-white"
                                value={otpInput}
                                onChange={(e) => onOtpInputChange(e.target.value)}
                              />
                              <Button size="sm" onClick={() => onConfirmOTP(visitor)}>Confirm</Button>
                              <Button size="sm" variant="ghost" onClick={onCancelOTP}>Cancel</Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => onSendOTP(visitor.id, visitor.phone)}
                              disabled={sendingOtpId === visitor.id}
                              className="whitespace-nowrap bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm disabled:opacity-50"
                            >
                              {sendingOtpId === visitor.id ? "Sending..." : "Verify & Send OTP"}
                            </Button>
                          )
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => onCheckOut(visitor.id)} className="whitespace-nowrap bg-white/60 hover:bg-zinc-100 text-zinc-700 shadow-sm">Check Out</Button>
                        )}
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
