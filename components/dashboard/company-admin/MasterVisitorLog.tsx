"use client";

import Image from "next/image";
import { Eye } from "lucide-react";
import { EmptyState, LoadingSkeleton } from "@/components/dashboard/shared/StateBlocks";
import { SearchInput, SelectField } from "@/components/dashboard/shared/Fields";
import { DataTableShell } from "@/components/dashboard/shared/DataTableShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  company_id: string;
  name: string;
  phone: string;
  document_type: string;
  id_number: string;
  status: string;
  created_at: string;
  checked_out_at?: string;
  pass_expired_at?: string | null;
  host_name?: string;
  host_confirmed?: boolean;
  host_confirmed_at?: string | null;
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

const CustomStatusBadge = ({
  status,
  isOverride,
}: {
  status: string;
  isOverride?: boolean;
}) => {
  const normalizedStatus = normalizeVisitorStatus(status);
  const label = getVisitorStatusLabel(status, isOverride);

  if (isOverride && normalizedStatus !== "checked_out") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
        {label}
      </span>
    );
  }

  switch (normalizedStatus) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
          {label}
        </span>
      );

    case "checked_in":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
          {label}
        </span>
      );

    case "checked_out":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
            isOverride
              ? "border-orange-200 bg-orange-100 text-orange-800"
              : "border-slate-200 bg-slate-100 text-slate-700"
          }`}
        >
          {label}
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
          {label}
        </span>
      );
  }
};

const getVisitorInitial = (name: string) => {
  return name?.charAt(0)?.toUpperCase() || "V";
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

          <SelectField
            value={gateFilter}
            onChange={(e) => onGateFilterChange(e.target.value)}
            className="h-11 bg-slate-50 border-slate-200"
          >
            <option value="all">All Gates</option>
            <option value="unassigned">Unassigned</option>
            {gates.map((gate) => (
              <option key={gate.id} value={gate.id}>
                {gate.name}
              </option>
            ))}
          </SelectField>

          <SelectField
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-11 bg-slate-50 border-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="checked_in">Inside</option>
            <option value="checked_out">Departed</option>
          </SelectField>
        </div>
      }
    >
      <div className="border-b border-slate-100 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            Filter records
            {hasActiveFilters && (
              <Badge className="border-none bg-blue-100 text-blue-700 hover:bg-blue-100">
                Active filters
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="w-full space-y-1.5">
              <label
                htmlFor="entry-records-start-date"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                From Date
              </label>
              <Input
                id="entry-records-start-date"
                type="date"
                className="h-10 w-full border-slate-200 bg-slate-50"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>

            <div className="w-full space-y-1.5">
              <label
                htmlFor="entry-records-end-date"
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                To Date
              </label>
              <Input
                id="entry-records-end-date"
                type="date"
                className="h-10 w-full border-slate-200 bg-slate-50"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="p-5">
            <LoadingSkeleton rows={5} />
          </div>
        ) : visitors.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title={hasActiveFilters ? "No matching visitors found" : "No visitor records yet"}
              description={
                hasActiveFilters
                  ? "Try adjusting the search, status, gate, or date filters."
                  : "New visitor records will appear here once people check in."
              }
            />
          </div>
        ) : (
          <>
            {/* Mobile Stacked Cards */}
            <div className="grid gap-4 p-4 sm:hidden">
              {visitors.map((visitor) => {
                const hasCustomData =
                  visitor.custom_data &&
                  Object.values(visitor.custom_data).some((value) => value.trim() !== "");

                const hasExtraInfo =
                  visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;

                const isOverride = visitor.custom_data?.manual_override === "true";

                return (
                  <div
                    key={visitor.id}
                    className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <CustomStatusBadge status={visitor.status} isOverride={isOverride} />
                      <span className="shrink-0 text-xs font-bold text-slate-500">
                        {new Date(visitor.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
                      {visitor.photo_url ? (
                        <Image
                          src={visitor.photo_url}
                          alt={`${visitor.name}'s photo`}
                          width={48}
                          height={48}
                          className="h-12 w-12 cursor-pointer rounded-2xl border border-slate-200 object-cover shadow-sm"
                          onClick={() => onPhotoClick(visitor.photo_url!)}
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-lg font-bold text-blue-600">
                          {getVisitorInitial(visitor.name)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-slate-900">
                          {visitor.name}
                        </span>
                        <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                          {visitor.host_name ? `Host: ${visitor.host_name}` : "Walk-in entry"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="block text-xs font-bold text-slate-400">Phone</span>
                        <span className="break-words font-medium text-slate-700">
                          {visitor.phone || "—"}
                        </span>
                      </div>

                      <div>
                        <span className="block text-xs font-bold text-slate-400">Gate</span>
                        <span className="break-words font-medium text-slate-700">
                          {getGateName(visitor.gate_id)}
                        </span>
                      </div>

                      <div className="col-span-2 pt-2">
                        <span className="text-xs text-slate-500">
                          {new Date(visitor.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {visitor.checked_out_at &&
                            ` - ${new Date(visitor.checked_out_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`}
                        </span>
                      </div>
                    </div>

                    {hasExtraInfo && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onInfoClick(visitor)}
                        aria-label={`View details for ${visitor.name}`}
                        className="mt-4 h-11 w-full rounded-xl border-blue-200 bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                        View details
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader className="border-b border-slate-200 bg-slate-50/80">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Visitor Details
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Entry Gate
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Time In
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Time Out
                    </TableHead>
                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {visitors.map((visitor) => {
                    const hasCustomData =
                      visitor.custom_data &&
                      Object.values(visitor.custom_data).some((value) => value.trim() !== "");

                    const hasExtraInfo =
                      visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;

                    const isOverride = visitor.custom_data?.manual_override === "true";

                    return (
                      <TableRow key={visitor.id} className="hover:bg-slate-50/50">
                        <TableCell className="whitespace-nowrap font-bold text-slate-600">
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
                                className="h-10 w-10 shrink-0 cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 object-cover shadow-sm transition-opacity hover:opacity-80"
                                onClick={() => onPhotoClick(visitor.photo_url!)}
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 font-bold text-blue-600">
                                {getVisitorInitial(visitor.name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <span className="block whitespace-nowrap font-bold text-slate-900">
                                {visitor.name}
                              </span>
                              <div className="mt-0.5 whitespace-nowrap text-xs font-medium text-slate-500">
                                {visitor.phone || "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {getGateName(visitor.gate_id)}
                          </span>
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <CustomStatusBadge status={visitor.status} isOverride={isOverride} />
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-sm font-medium text-slate-700">
                          {new Date(visitor.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-sm font-medium text-slate-500">
                          {visitor.checked_out_at
                            ? new Date(visitor.checked_out_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--"}
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-right">
                          {hasExtraInfo ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onInfoClick(visitor)}
                              aria-label={`View details for ${visitor.name}`}
                              className="h-9 rounded-xl border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View details
                            </Button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">—</span>
                          )}
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
