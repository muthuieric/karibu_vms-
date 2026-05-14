"use client";

import Image from "next/image";
import { CheckCircle2, Info, ShieldCheck, Timer, UserCircle } from "lucide-react";
import { DataTableShell } from "@/components/dashboard/shared/DataTableShell";
import { SearchInput } from "@/components/dashboard/shared/Fields";
import { EmptyState, LoadingSkeleton } from "@/components/dashboard/shared/StateBlocks";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { Button } from "@/components/ui/button";
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
  host_id?: string | null;
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
  planTier: string;
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
  onDirectApprove: (visitor: Visitor) => void;
  onManualOverride: (visitor: Visitor) => void;
};

export default function GuardVisitorsTable({
  loading,
  visitors,
  searchTerm,
  statusFilter,
  planTier,
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
  onDirectApprove,
  onManualOverride,
}: GuardVisitorsTableProps) {
  return (
    <DataTableShell
      title="Visitor Queue"
      description="Search arrivals, verify pending requests, and check people out from the active gate list."
      filters={
        <div className="flex flex-col gap-3 xl:min-w-[42rem] xl:flex-row xl:items-center">
            <SearchInput
              placeholder="Search visitor, phone, or ID..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              inputClassName="h-11"
            />
            <div className="flex w-full sm:w-auto bg-surface-muted p-1 rounded-xl border border-border overflow-x-auto">
              <button
                onClick={() => onStatusFilterChange("all")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${statusFilter === "all" ? "bg-surface shadow-sm text-text-main" : "text-text-muted hover:text-text-main"}`}
              >
                All
              </button>
              <button
                onClick={() => onStatusFilterChange("pending")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${statusFilter === "pending" ? "bg-surface shadow-sm text-warning-foreground" : "text-text-muted hover:text-text-main"}`}
              >
                Pending
              </button>
              <button
                onClick={() => onStatusFilterChange("checked_in")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${statusFilter === "checked_in" ? "bg-surface shadow-sm text-emerald-700" : "text-text-muted hover:text-text-main"}`}
              >
                Checked In
              </button>
            </div>
        </div>
      }
    >
      <div className="p-0 sm:p-5">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : visitors.length === 0 ? (
          <EmptyState title="No active visitors found" description="Try another search or filter, or add a new visitor at the desk." />
        ) : (
          <div className="overflow-hidden rounded-none border-0 bg-white sm:rounded-[1.25rem] sm:border sm:border-slate-200">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="text-slate-600 font-semibold">Arrived</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Visitor</TableHead>
                  <TableHead className="text-slate-600 font-semibold">Credentials</TableHead>
                  <TableHead className="text-slate-600 font-semibold">State</TableHead>
                  <TableHead className="text-right text-slate-600 font-semibold">Desk Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => {
                  const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                  const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;

                  return (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium text-text-muted whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-600">
                          <Timer className="h-3.5 w-3.5" />
                          {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {visitor.photo_url ? (
                            <Image
                              src={visitor.photo_url}
                              alt={`${visitor.name}'s photo`}
                              width={40}
                              height={40}
                            className="w-11 h-11 rounded-2xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity bg-surface shrink-0 shadow-sm"
                              onClick={() => onPhotoClick(visitor.photo_url!)}
                              unoptimized
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-primary shrink-0">
                              <UserCircle className="w-6 h-6" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold whitespace-nowrap text-slate-950">{visitor.name}</span>

                              {hasExtraInfo && (
                                <button
                                  onClick={() => onInfoClick(visitor)}
                                  className="text-primary bg-primary/10 hover:bg-primary/15 p-1.5 rounded-full transition-colors shrink-0 shadow-sm border border-primary/15"
                                  title="View Visit Info"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="mt-1 text-xs font-medium text-slate-500">{visitor.host_name ? `Host: ${visitor.host_name}` : "Walk-in entry"}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm whitespace-nowrap">{visitor.phone || "—"}</div>
                        <div className="text-xs text-text-muted whitespace-nowrap">{visitor.id_number || "No ID"}</div>
                      </TableCell>

                      <TableCell>
                        {visitor.status === "pending" ? (
                          <StatusBadge status="pending" />
                        ) : visitor.custom_data?.manual_override === "true" ? (
                          <StatusBadge status="manual_override" />
                        ) : (
                          <StatusBadge status="checked_in">
                            <ShieldCheck className="h-3 w-3" /> Checked in
                          </StatusBadge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {visitor.status === "pending" ? (
                          planTier === "basic" ? (
                            <Button
                              size="sm"
                              onClick={() => onDirectApprove(visitor)}
                              className="whitespace-nowrap"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Entry
                            </Button>
                          ) : (
                            visitor.custom_data?.source === "guard_desk" ? (
                              <Button
                                size="sm"
                                onClick={() => onManualOverride(visitor)}
                                className="whitespace-nowrap bg-warning text-white hover:bg-warning/90"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Override
                              </Button>
                            ) : verifyingId === visitor.id ? (
                              <div className="flex items-center justify-end gap-2">
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="OTP"
                                  className="w-20 rounded-xl border border-input bg-surface px-2 py-2 text-center text-sm font-bold"
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
                                className="whitespace-nowrap"
                                variant="outline"
                              >
                                {sendingOtpId === visitor.id ? "Sending..." : "Verify & Send OTP"}
                              </Button>
                            )
                          )
                        ) : (
                          <Button size="sm" variant="secondary" onClick={() => onCheckOut(visitor.id)} className="whitespace-nowrap">Check Out</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DataTableShell>
  );
}
