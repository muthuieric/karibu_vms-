"use client";

import Image from "next/image";
import { Info, ShieldCheck, Timer } from "lucide-react";
import { SearchInput } from "@/components/dashboard/shared/Fields";
import { EmptyState, LoadingSkeleton } from "@/components/dashboard/shared/StateBlocks";
import { Button } from "@/components/ui/button";
import { getVisitorStatusLabel, normalizeVisitorStatus } from "@/lib/visitor-display";
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

const CustomStatusBadge = ({ status, isOverride }: { status: string, isOverride?: boolean }) => {
  const normalizedStatus = normalizeVisitorStatus(status);
  const label = getVisitorStatusLabel(status, isOverride);

  if (isOverride && normalizedStatus !== "checked_out") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200">
        {label}
      </span>
    );
  }
  switch (normalizedStatus) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200">
          {label}
        </span>
      );
    case "checked_in":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" /> {label}
        </span>
      );
    case "checked_out":
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
          isOverride
            ? "bg-orange-100 text-orange-800 border-orange-200"
            : "bg-slate-100 text-slate-700 border-slate-200"
        }`}>
          {label}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
          {label}
        </span>
      );
  }
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
  
  const renderActions = (visitor: Visitor) => {
    if (visitor.status === "pending") {
      if (planTier === "basic") {
        return (
          <Button
            size="sm"
            onClick={() => onDirectApprove(visitor)}
            className="w-full sm:w-auto whitespace-nowrap bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-sm"
          >
            Approve
          </Button>
        );
      }
      
      if (visitor.custom_data?.source === "guard_desk") {
        return (
          <Button
            size="sm"
            onClick={() => onManualOverride(visitor)}
            className="w-full sm:w-auto whitespace-nowrap bg-orange-500 font-bold text-white hover:bg-orange-600 shadow-sm"
          >
            Override
          </Button>
        );
      }
      
      if (verifyingId === visitor.id) {
        return (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto sm:justify-end">
            <input
              type="text"
              maxLength={4}
              placeholder="OTP"
              className="w-full sm:w-20 rounded-xl border border-slate-300 bg-white px-2 py-2 text-center text-sm font-bold shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={otpInput}
              onChange={(e) => onOtpInputChange(e.target.value)}
            />
            <div className="flex w-full sm:w-auto gap-2">
              <Button size="sm" onClick={() => onConfirmOTP(visitor)} className="flex-1 sm:flex-none font-bold bg-blue-600 text-white hover:bg-blue-700">Confirm</Button>
              <Button size="sm" variant="outline" onClick={onCancelOTP} className="flex-1 sm:flex-none font-bold border-slate-200">Cancel</Button>
            </div>
          </div>
        );
      }
      
      return (
        <Button
          size="sm"
          onClick={() => onSendOTP(visitor.id, visitor.phone)}
          disabled={sendingOtpId === visitor.id}
          className="w-full sm:w-auto whitespace-nowrap font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          variant="outline"
        >
          {sendingOtpId === visitor.id ? "Sending..." : "Send OTP"}
        </Button>
      );
    }
    
    return (
      <Button 
        size="sm" 
        variant="outline" 
        onClick={() => onCheckOut(visitor.id)} 
        className="w-full sm:w-auto whitespace-nowrap font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
      >
        Check Out
      </Button>
    );
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between rounded-[1.4rem] border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-slate-900">Visitor Queue</h2>
          <p className="text-sm text-slate-500">Search and manage active requests.</p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              placeholder="Search visitor, phone, or ID..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              inputClassName="h-11 bg-slate-50 border-slate-200 w-full sm:w-72"
            />
            <div className="flex w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
              <button
                onClick={() => onStatusFilterChange("all")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${statusFilter === "all" ? "bg-white shadow-sm text-blue-700" : "text-slate-500 hover:text-slate-900"}`}
              >
                All
              </button>
              <button
                onClick={() => onStatusFilterChange("pending")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${statusFilter === "pending" ? "bg-white shadow-sm text-orange-700" : "text-slate-500 hover:text-slate-900"}`}
              >
                Pending
              </button>
              <button
                onClick={() => onStatusFilterChange("checked_in")}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-bold rounded-lg transition-colors whitespace-nowrap ${statusFilter === "checked_in" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500 hover:text-slate-900"}`}
              >
                Checked In
              </button>
            </div>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="rounded-[1.4rem] border border-blue-100 bg-white p-5 shadow-sm"><LoadingSkeleton rows={5} /></div>
        ) : visitors.length === 0 ? (
          <EmptyState title="No active visitors found" description="Try another search or filter, or add a new visitor at the desk." />
        ) : (
          <>
            {/* Mobile Stacked Cards */}
            <div className="grid gap-4 sm:hidden">
              {visitors.map((visitor) => {
                const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;
                const isOverride = visitor.custom_data?.manual_override === "true";

                return (
                  <div key={visitor.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <CustomStatusBadge status={visitor.status} isOverride={isOverride} />
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Timer className="h-3.5 w-3.5" />
                        {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                      {visitor.photo_url ? (
                        <Image
                          src={visitor.photo_url}
                          alt={`${visitor.name}'s photo`}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 cursor-pointer shadow-sm"
                          onClick={() => onPhotoClick(visitor.photo_url!)}
                          unoptimized
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 shrink-0 font-bold text-lg">
                          {visitor.name.charAt(0)}
                        </div>
                      )}
                      
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">{visitor.name}</span>
                          {hasExtraInfo && (
                            <button
                              onClick={() => onInfoClick(visitor)}
                              className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-full transition-colors shrink-0"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                          {visitor.host_name ? `Host: ${visitor.host_name}` : "Walk-in entry"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">Phone</span>
                        <span className="font-medium text-slate-700">{visitor.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-400">ID Number</span>
                        <span className="font-medium text-slate-700">{visitor.id_number || "—"}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      {hasExtraInfo && (
                        <button
                          onClick={() => onInfoClick(visitor)}
                          className="w-full px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                          aria-label={`View details for ${visitor.name}`}
                        >
                          View details
                        </button>
                      )}
                      {renderActions(visitor)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-hidden rounded-[1.4rem] border border-blue-100 bg-white shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-slate-600 font-bold uppercase tracking-wider text-xs">Arrived</TableHead>
                    <TableHead className="text-slate-600 font-bold uppercase tracking-wider text-xs">Visitor</TableHead>
                    <TableHead className="text-slate-600 font-bold uppercase tracking-wider text-xs">Credentials</TableHead>
                    <TableHead className="text-slate-600 font-bold uppercase tracking-wider text-xs">State</TableHead>
                    <TableHead className="text-right text-slate-600 font-bold uppercase tracking-wider text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => {
                    const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                    const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;
                    const isOverride = visitor.custom_data?.manual_override === "true";

                    return (
                      <TableRow key={visitor.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-medium text-slate-500 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600">
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
                                width={44}
                                height={44}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity bg-slate-50 shrink-0 shadow-sm"
                                onClick={() => onPhotoClick(visitor.photo_url!)}
                                unoptimized
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 shrink-0 font-bold">
                                {visitor.name.charAt(0)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold whitespace-nowrap text-slate-900">{visitor.name}</span>
                              </div>
                              <p className="mt-1 text-xs font-medium text-slate-500">{visitor.host_name ? `Host: ${visitor.host_name}` : "Walk-in entry"}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm font-medium text-slate-700 whitespace-nowrap">{visitor.phone || "—"}</div>
                          <div className="text-xs text-slate-500 whitespace-nowrap mt-0.5">{visitor.id_number || "No ID"}</div>
                        </TableCell>

                        <TableCell>
                          <CustomStatusBadge status={visitor.status} isOverride={isOverride} />
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasExtraInfo && (
                              <button
                                onClick={() => onInfoClick(visitor)}
                                className="px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors whitespace-nowrap"
                                aria-label={`View details for ${visitor.name}`}
                              >
                                View details
                              </button>
                            )}
                            {renderActions(visitor)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
