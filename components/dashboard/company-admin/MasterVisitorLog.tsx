"use client";

import Image from "next/image";
import { DoorOpen, Filter, Info, UserCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="shadow-sm">
      <CardHeader className="space-y-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <CardTitle>Master Visitor Log</CardTitle>
            <CardDescription>Comprehensive record of all building access.</CardDescription>
          </div>
          <div className="w-full md:w-80">
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Search Records</label>
            <Input
              placeholder="Search name, host, or vehicle..."
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="bg-white h-10 w-full"
            />
          </div>
        </div>

        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-4">
            <Filter className="w-4 h-4 text-zinc-500" /> Filter Options
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 w-full">
              <label className="text-xs font-medium text-zinc-500 block">Entry Gate</label>
              <select
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-700 font-medium"
                value={gateFilter}
                onChange={(e) => onGateFilterChange(e.target.value)}
              >
                <option value="all">All Gates</option>
                <option value="unassigned">Unassigned (Walk-ins)</option>
                {gates.map((gate) => (
                  <option key={gate.id} value={gate.id}>
                    {gate.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 w-full">
              <label className="text-xs font-medium text-zinc-500 block">Status</label>
              <select
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-zinc-700 font-medium"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="checked_in">Inside (Checked In)</option>
                <option value="checked_out">Departed (Checked Out)</option>
                <option value="auto_checked_out">Auto Checked Out</option>
              </select>
            </div>

            <div className="space-y-1.5 w-full">
              <label className="text-xs font-medium text-zinc-500 block">From Date</label>
              <Input
                type="date"
                className="h-10 w-full bg-white text-zinc-700"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 w-full">
              <label className="text-xs font-medium text-zinc-500 block">To Date</label>
              <Input
                type="date"
                className="h-10 w-full bg-white text-zinc-700"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-6 sm:pt-0">
        {loading ? (
          <p className="text-zinc-500 py-6 text-center">Loading reports...</p>
        ) : visitors.length === 0 ? (
          <p className="text-zinc-500 py-6 text-center">
            {hasActiveFilters ? "No matching visitors found for these filters." : "No records found."}
          </p>
        ) : (
          <div className="rounded-none sm:rounded-md border-y sm:border overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
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
                      <TableCell className="font-medium text-zinc-600 whitespace-nowrap">
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
                              className="w-10 h-10 rounded-full object-cover border-2 border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity bg-white shrink-0"
                              onClick={() => onPhotoClick(visitor.photo_url!)}
                              unoptimized
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border-2 border-zinc-200 text-zinc-400 shrink-0">
                              <UserCircle className="w-6 h-6" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-zinc-900 whitespace-nowrap">{visitor.name}</span>
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
                            <div className="text-xs text-zinc-500 whitespace-nowrap">{visitor.phone || "—"}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                          <DoorOpen className="h-3 w-3" />
                          {getGateName(visitor.gate_id)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {visitor.status === "pending" && <span className="text-amber-600 text-xs font-bold uppercase">Pending</span>}
                        {visitor.status === "checked_in" && <span className="text-green-600 text-xs font-bold uppercase">Inside</span>}
                        {visitor.status === "checked_out" && <span className="text-zinc-500 text-xs font-bold uppercase">Departed</span>}
                        {visitor.status === "auto_checked_out" && <span className="text-purple-600 text-xs font-bold uppercase">Auto-Departed</span>}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-500 whitespace-nowrap">
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
      </CardContent>
    </Card>
  );
}
