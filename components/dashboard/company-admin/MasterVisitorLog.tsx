"use client";

import Image from "next/image";
import { DoorOpen, Filter, Info, UserCircle } from "lucide-react";
import { EmptyState, LoadingSkeleton } from "@/components/dashboard/shared/StateBlocks";
import { SearchInput, SelectField } from "@/components/dashboard/shared/Fields";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
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
      title="Master Visitor Log"
      description="Search, filter, and audit every building access event."
      filters={
        <div className="grid gap-3 lg:min-w-[44rem] lg:grid-cols-[1.2fr_1fr_1fr]">
          <SearchInput
            placeholder="Search name, host, vehicle..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            inputClassName="h-11"
          />
          <SelectField value={gateFilter} onChange={(e) => onGateFilterChange(e.target.value)} className="h-11">
            <option value="all">All Gates</option>
            <option value="unassigned">Unassigned</option>
            {gates.map((gate) => (
              <option key={gate.id} value={gate.id}>
                {gate.name}
              </option>
            ))}
          </SelectField>
          <SelectField value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="h-11">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Inside</option>
            <option value="checked_out">Departed</option>
            <option value="auto_checked_out">Auto Checked Out</option>
          </SelectField>
        </div>
      }
    >
      <div className="border-b border-slate-200/80 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-main">
            <Filter className="w-4 h-4 text-text-muted" /> Date Controls
            {hasActiveFilters && <Badge variant="info">Active filters</Badge>}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 w-full">
              <label className="text-xs font-medium text-text-muted block">From Date</label>
              <Input
                type="date"
                className="h-10 w-full"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 w-full">
              <label className="text-xs font-medium text-text-muted block">To Date</label>
              <Input
                type="date"
                className="h-10 w-full"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-0 sm:p-5">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : visitors.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? "No matching visitors found" : "No visitor records yet"}
            description={hasActiveFilters ? "Try adjusting the search, status, gate, or date filters." : "New visitor records will appear here once people check in."}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface-muted">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="whitespace-nowrap">Visitor Details</TableHead>
                  <TableHead className="whitespace-nowrap">Entry Gate</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Time In</TableHead>
                  <TableHead className="whitespace-nowrap">Time Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitors.map((visitor) => {
                  const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                  const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;

                  return (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium text-text-muted whitespace-nowrap">
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
                              className="w-10 h-10 rounded-full object-cover border-2 border-border cursor-pointer hover:opacity-80 transition-opacity bg-surface shrink-0"
                              onClick={() => onPhotoClick(visitor.photo_url!)}
                              unoptimized
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center border-2 border-border text-text-muted shrink-0">
                              <UserCircle className="w-6 h-6" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-text-main whitespace-nowrap">{visitor.name}</span>
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
                            <div className="text-xs text-text-muted whitespace-nowrap">{visitor.phone || "—"}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-muted px-2 py-1 text-xs font-medium text-text-muted ring-1 ring-inset ring-border">
                          <DoorOpen className="h-3 w-3" />
                          {getGateName(visitor.gate_id)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {visitor.status === "pending" && <StatusBadge status="pending" />}
                        {visitor.status === "checked_in" && (
                          visitor.custom_data?.manual_override === "true" 
                            ? <StatusBadge status="manual_override" />
                            : <StatusBadge status="checked_in">Inside</StatusBadge>
                        )}
                        {visitor.status === "checked_out" && <StatusBadge status="checked_out">Departed</StatusBadge>}
                        {visitor.status === "auto_checked_out" && <StatusBadge status="auto_checked_out">Auto-Departed</StatusBadge>}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-sm text-text-muted whitespace-nowrap">
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
        )}
      </div>
    </DataTableShell>
  );
}
