"use client";

import Image from "next/image";
import { EmptyState, LoadingSkeleton } from "@/components/dashboard/shared/StateBlocks";
import { SearchInput, SelectField } from "@/components/dashboard/shared/Fields";
import { DataTableShell } from "@/components/dashboard/shared/DataTableShell";
import { Badge } from "@/components/ui/badge";
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
  company_id: string;
  name: string;
  phone: string;
  document_type: string;
  id_number: string;
  status: "pending" | "checked_in" | "checked_out" | "auto_checked_out";
  created_at: string;
  checked_out_at?: string;
  host_name?: string;
  host_confirmed?: boolean;
  purpose?: string;
  vehicle_reg?: string;
  photo_url?: string;
  custom_data?: Record<string, string>;
  gate_id?: string | null;
};

type Gate = {
  id: string;
  name: string;
};

type MasterVisitorLogProps = {
  loading: boolean;
  visitors: Visitor[];
  gates: Gate[];
  searchQuery: string;
  statusFilter: string;
  gateFilter: string;
  startDate: string;
  endDate: string;
  hasActiveFilters: boolean;
  getGateName: (gateId?: string | null) => string;
  onSearchQueryChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onGateFilterChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onPhotoClick: (photoUrl: string) => void;
  onInfoClick: (visitor: Visitor) => void;
};

const CustomStatusBadge = ({ status, isOverride }: { status: string, isOverride?: boolean }) => {
  if (isOverride) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200">
        Override
      </span>
    );
  }
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800 border border-orange-200">
          Pending
        </span>
      );
    case "checked_in":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
          Inside
        </span>
      );
    case "checked_out":
    case "auto_checked_out":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
          Departed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800 border border-red-200">
          Restricted
        </span>
      );
  }
};

export default function MasterVisitorLog({
  loading,
  visitors,
  gates,
  searchQuery,
  statusFilter,
  gateFilter,
  startDate,
  endDate,
  hasActiveFilters,
  getGateName,
  onSearchQueryChange,
  onStatusFilterChange,
  onGateFilterChange,
  onStartDateChange,
  onEndDateChange,
  onPhotoClick,
  onInfoClick,
}: MasterVisitorLogProps) {
  return (
    <DataTableShell
      title="Entry Records"
      description="Search, filter, and audit every building access event."
      filters={
        <div className="grid gap-3 lg:min-w-[44rem] lg:grid-cols-[1.2fr_1fr_1fr]">
          <SearchInput
            placeholder="Search name, host, vehicle..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            inputClassName="h-11 bg-slate-50 border-slate-200"
          />
          <SelectField value={gateFilter} onChange={(e) => onGateFilterChange(e.target.value)} className="h-11 bg-slate-50 border-slate-200">
            <option value="all">All Gates</option>
            <option value="unassigned">Unassigned</option>
            {gates.map((gate) => (
              <option key={gate.id} value={gate.id}>
                {gate.name}
              </option>
            ))}
          </SelectField>
          <SelectField value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="h-11 bg-slate-50 border-slate-200">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Inside</option>
            <option value="checked_out">Departed</option>
            <option value="auto_checked_out">Auto Checked Out</option>
          </SelectField>
        </div>
      }
    >
      <div className="border-b border-slate-100 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            Filter records
            {hasActiveFilters && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Active filters</Badge>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 w-full">
              <label htmlFor="entry-records-start-date" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">From Date</label>
              <Input
                id="entry-records-start-date"
                type="date"
                className="h-10 w-full bg-slate-50 border-slate-200"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 w-full">
              <label htmlFor="entry-records-end-date" className="text-xs font-bold uppercase tracking-wider text-slate-500 block">To Date</label>
              <Input
                id="entry-records-end-date"
                type="date"
                className="h-10 w-full bg-slate-50 border-slate-200"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="p-5"><LoadingSkeleton rows={5} /></div>
        ) : visitors.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={hasActiveFilters ? "No matching visitors found" : "No visitor records yet"}
              description={hasActiveFilters ? "Try adjusting the search, status, gate, or date filters." : "New visitor records will appear here once people check in."}
            />
          </div>
        ) : (
          <>
            {/* Mobile Stacked Cards */}
            <div className="grid gap-4 p-4 sm:hidden">
              {visitors.map((visitor) => {
                const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;
                const isOverride = visitor.custom_data?.manual_override === "true";

                return (
                  <div key={visitor.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <CustomStatusBadge status={visitor.status} isOverride={isOverride} />
                      <span className="text-xs font-bold text-slate-500">
                        {new Date(visitor.created_at).toLocaleDateString()}
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
                              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors shrink-0"
                            >
                              Details
                            </button>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">
                          {visitor.host_name ? `Host: ${visitor.host_name}` : "Walk-in entry"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="block text-xs font-bold text-slate-400">Phone</span>
                        <span className="font-medium text-slate-700">{visitor.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-400">Gate</span>
                        <span className="font-medium text-slate-700">{getGateName(visitor.gate_id)}</span>
                      </div>
                      <div className="col-span-2 pt-2">
                        <span className="text-xs text-slate-500">
                          {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {visitor.checked_out_at && ` - ${new Date(visitor.checked_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Date</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Visitor Details</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Entry Gate</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Status</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Time In</TableHead>
                    <TableHead className="text-slate-500 font-bold uppercase tracking-wider text-xs">Time Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => {
                    const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                    const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;
                    const isOverride = visitor.custom_data?.manual_override === "true";

                    return (
                      <TableRow key={visitor.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-slate-600 whitespace-nowrap">
                          {new Date(visitor.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {visitor.photo_url ? (
                              <Image
                                src={visitor.photo_url}
                                alt={`${visitor.name}'s photo`}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-2xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity bg-slate-50 shrink-0 shadow-sm"
                                onClick={() => onPhotoClick(visitor.photo_url!)}
                                unoptimized
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 shrink-0 font-bold">
                                {visitor.name.charAt(0)}
                              </div>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 whitespace-nowrap">{visitor.name}</span>
                                {hasExtraInfo && (
                                  <button
                                    onClick={() => onInfoClick(visitor)}
                                    className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg transition-colors shrink-0 shadow-sm border border-blue-100"
                                  >
                                    Details
                                  </button>
                                )}
                              </div>
                              <div className="text-xs font-medium text-slate-500 whitespace-nowrap mt-0.5">{visitor.phone || "—"}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200">
                            {getGateName(visitor.gate_id)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <CustomStatusBadge status={visitor.status} isOverride={isOverride} />
                        </TableCell>
                        <TableCell className="text-sm font-medium whitespace-nowrap text-slate-700">
                          {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-slate-500 whitespace-nowrap">
                          {visitor.checked_out_at
                            ? new Date(visitor.checked_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "--"}
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
    </DataTableShell>
  );
}
