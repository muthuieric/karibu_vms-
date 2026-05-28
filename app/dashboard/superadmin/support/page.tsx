"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Building2, CheckCircle2, Clock3, Inbox, Mail, MessageSquareText, RefreshCw, Search } from "lucide-react";

import { DataTableShell } from "@/components/dashboard/shared/DataTableShell";
import { SearchInput, SelectField } from "@/components/dashboard/shared/Fields";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState, LoadingState } from "@/components/dashboard/shared/StateBlocks";
import { StatCard } from "@/components/dashboard/shared/StatCard";
import { StatusBadge } from "@/components/dashboard/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthHeaders } from "@/lib/client-auth";

type SupportStatus = "pending" | "in_progress" | "resolved";

type SupportTicket = {
  id: string;
  company_id: string | null;
  company_name: string;
  submitted_by: string;
  submitted_by_email: string | null;
  subject: string;
  description: string;
  status: SupportStatus;
  created_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status: SupportStatus) {
  if (status === "in_progress") return "In progress";
  return status;
}

export default function SuperadminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      const response = await fetch(`/api/superadmin/support${params.toString() ? `?${params}` : ""}`, {
        headers: await getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Support tickets could not be loaded.");
      setTickets(result.data || []);
    } catch (err) {
      console.error("Support ticket load error:", err);
      setError(err instanceof Error ? err.message : "Support tickets could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTickets();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchTickets]);

  const updateTicketStatus = async (ticketId: string, status: SupportStatus) => {
    setUpdatingTicketId(ticketId);
    setError("");

    try {
      const response = await fetch("/api/superadmin/support", {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ id: ticketId, status }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Support ticket could not be updated.");

      setTickets((currentTickets) =>
        currentTickets.map((ticket) => (ticket.id === ticketId ? result.data : ticket))
      );
    } catch (err) {
      console.error("Support ticket update error:", err);
      setError(err instanceof Error ? err.message : "Support ticket could not be updated.");
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tickets;

    return tickets.filter((ticket) =>
      [
        ticket.company_name,
        ticket.submitted_by,
        ticket.submitted_by_email || "",
        ticket.subject,
        ticket.description,
        ticket.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [tickets, searchTerm]);

  const pendingCount = tickets.filter((ticket) => ticket.status === "pending").length;
  const inProgressCount = tickets.filter((ticket) => ticket.status === "in_progress").length;
  const resolvedCount = tickets.filter((ticket) => ticket.status === "resolved").length;

  return (
    <PageContainer className="max-w-7xl">
      <PageHeader
        title="Support Inbox"
        eyebrow="Platform help desk"
        description="Read support messages from all workspaces and update their resolution status."
        icon={Inbox}
      />

      {error && (
        <div className="flex items-start gap-3 rounded-[1.4rem] border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Pending" value={pendingCount.toLocaleString()} description="Waiting for your response" icon={Clock3} tone={pendingCount > 0 ? "warning" : "neutral"} />
        <StatCard label="In progress" value={inProgressCount.toLocaleString()} description="Currently being handled" icon={MessageSquareText} tone="primary" />
        <StatCard label="Resolved" value={resolvedCount.toLocaleString()} description="Completed tickets" icon={CheckCircle2} tone="success" />
      </div>

      <DataTableShell
        title="All support messages"
        description="Messages submitted from workspace help desks."
        filters={
          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] lg:w-[42rem]">
            <SearchInput
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <SelectField value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </SelectField>
            <Button type="button" variant="outline" onClick={() => fetchTickets({ silent: true })} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="p-5">
            <LoadingState label="Loading support tickets..." />
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No support tickets yet" description="Workspace messages will appear here once admins submit help desk requests." icon={Mail} />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No matching tickets" description="Try another search term or status filter." icon={Search} />
          </div>
        ) : (
          <>
            <div className="hidden xl:block">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-6">Workspace</TableHead>
                    <TableHead>Subject & Message</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="align-top">
                      <TableCell className="pl-6 font-semibold text-slate-900">
                        <div className="flex max-w-[220px] items-start gap-2">
                          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <span className="line-clamp-2">{ticket.company_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xl">
                        <p className="font-bold text-slate-900">{ticket.subject}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-500">{ticket.description}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-700">{ticket.submitted_by}</p>
                        {ticket.submitted_by_email && <p className="text-xs font-medium text-slate-500">{ticket.submitted_by_email}</p>}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-slate-500">{formatDate(ticket.created_at)}</TableCell>
                      <TableCell><StatusBadge status={ticket.status}>{getStatusLabel(ticket.status)}</StatusBadge></TableCell>
                      <TableCell className="pr-6 text-right">
                        <SelectField
                          value={ticket.status}
                          disabled={updatingTicketId === ticket.id}
                          onChange={(event) => updateTicketStatus(ticket.id, event.target.value as SupportStatus)}
                          className="ml-auto w-36"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </SelectField>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-slate-100 xl:hidden">
              {filteredTickets.map((ticket) => (
                <article key={ticket.id} className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{ticket.company_name}</p>
                      <h3 className="mt-1 text-base font-bold text-slate-900">{ticket.subject}</h3>
                    </div>
                    <StatusBadge status={ticket.status}>{getStatusLabel(ticket.status)}</StatusBadge>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{ticket.description}</p>

                  <div className="grid gap-3 rounded-2xl bg-slate-50 p-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Submitted by</p>
                      <p className="font-semibold text-slate-800">{ticket.submitted_by}</p>
                      {ticket.submitted_by_email && <p className="text-xs text-slate-500">{ticket.submitted_by_email}</p>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</p>
                      <p className="font-semibold text-slate-800">{formatDate(ticket.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Update status</p>
                      <SelectField
                        value={ticket.status}
                        disabled={updatingTicketId === ticket.id}
                        onChange={(event) => updateTicketStatus(ticket.id, event.target.value as SupportStatus)}
                        className="mt-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </SelectField>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </DataTableShell>
    </PageContainer>
  );
}
