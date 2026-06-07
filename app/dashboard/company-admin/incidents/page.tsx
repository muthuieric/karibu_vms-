"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ClipboardCheck, Loader2, ShieldAlert } from "lucide-react";

import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState, LoadingSkeleton } from "@/components/dashboard/shared/StateBlocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAuthHeaders } from "@/lib/client-auth";

type IncidentType =
  | "visitor_related"
  | "gate_issue"
  | "restricted_attempt"
  | "suspicious_activity"
  | "property_issue"
  | "emergency"
  | "other";

type Urgency = "low" | "normal" | "high" | "critical";
type ReviewStatus = "pending_review" | "reviewed" | "dismissed" | "linked_to_restriction";
type Relation<T> = T | T[] | null;

type IncidentReport = {
  id: string;
  visitor_id: string | null;
  gate_id: string | null;
  incident_type: IncidentType;
  urgency: Urgency;
  description: string;
  action_taken: string | null;
  status: ReviewStatus;
  admin_notes: string | null;
  created_at: string;
  visitors: Relation<{ name: string | null; phone: string | null; id_number: string | null }>;
  gates: Relation<{ name: string | null }>;
};

const incidentLabels: Record<IncidentType, string> = {
  visitor_related: "Visitor related",
  gate_issue: "Entry point issue",
  restricted_attempt: "Restricted attempt",
  suspicious_activity: "Suspicious activity",
  property_issue: "Property issue",
  emergency: "Emergency",
  other: "Other",
};

const urgencyLabels: Record<Urgency, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  critical: "Critical",
};

const statusLabels: Record<ReviewStatus, string> = {
  pending_review: "Pending review",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
  linked_to_restriction: "Linked to restriction",
};

const statusOptions: ReviewStatus[] = ["pending_review", "reviewed", "dismissed", "linked_to_restriction"];

function firstRelation<T>(relation: Relation<T>): T | null {
  if (Array.isArray(relation)) return relation[0] || null;
  return relation;
}

function getUrgencyClass(urgency: Urgency) {
  switch (urgency) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-700";
    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "low":
      return "border-slate-200 bg-slate-50 text-slate-600";
    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function getStatusClass(status: ReviewStatus) {
  switch (status) {
    case "reviewed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "dismissed":
      return "border-slate-200 bg-slate-50 text-slate-600";
    case "linked_to_restriction":
      return "border-red-200 bg-red-50 text-red-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

export default function CompanyAdminIncidentReportsPage() {
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, ReviewStatus>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const loadReports = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/incident-reports", {
        cache: "no-store",
        headers: await getAuthHeaders(),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Incident reports could not be loaded.");
      }

      const nextReports = (result.data || []) as IncidentReport[];
      setReports(nextReports);
      setStatusDrafts(
        Object.fromEntries(nextReports.map((report) => [report.id, report.status])) as Record<string, ReviewStatus>
      );
      setNoteDrafts(Object.fromEntries(nextReports.map((report) => [report.id, report.admin_notes || ""])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Incident reports could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const updateReport = async (report: IncidentReport) => {
    const nextStatus = statusDrafts[report.id] || report.status;
    const nextNotes = noteDrafts[report.id] || "";

    setSavingId(report.id);
    setError(null);

    try {
      const response = await fetch("/api/incident-reports", {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          id: report.id,
          status: nextStatus,
          admin_notes: nextNotes.trim() || null,
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Incident report could not be updated.");
      }

      setReports((currentReports) =>
        currentReports.map((currentReport) =>
          currentReport.id === report.id
            ? { ...currentReport, status: nextStatus, admin_notes: nextNotes.trim() || null }
            : currentReport
        )
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Incident report could not be updated.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-full bg-background p-4 pb-20 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Incident Reports"
          description="Review guard-submitted reports and record the admin outcome."
          icon={ShieldAlert}
          tone="warning"
        >
          <Button type="button" variant="outline" onClick={() => void loadReports()} disabled={loading} className="h-11 rounded-xl border-slate-200 font-bold">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ClipboardCheck className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </PageHeader>

        {error && (
          <div className="flex gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-xl font-black text-slate-900">Reports queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-5">
                <LoadingSkeleton rows={6} />
              </div>
            ) : reports.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  title="No incident reports"
                  description="Submitted incident reports will appear here for admin review."
                  icon={ShieldAlert}
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-4 sm:pl-6">Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Visitor</TableHead>
                    <TableHead>Gate</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Action taken</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="pr-4 sm:pr-6">Admin review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => {
                    const visitor = firstRelation(report.visitors);
                    const gate = firstRelation(report.gates);
                    const isSaving = savingId === report.id;

                    return (
                      <TableRow key={report.id} className="align-top">
                        <TableCell className="pl-4 font-bold text-slate-900 sm:pl-6">
                          {incidentLabels[report.incident_type]}
                        </TableCell>
                        <TableCell>
                          <Badge className={getUrgencyClass(report.urgency)}>{urgencyLabels[report.urgency]}</Badge>
                        </TableCell>
                        <TableCell className="max-w-48 whitespace-normal">
                          <p className="font-bold text-slate-800">{visitor?.name || "General report"}</p>
                          {visitor?.phone && <p className="text-xs font-medium text-slate-500">{visitor.phone}</p>}
                        </TableCell>
                        <TableCell>{gate?.name || "Unassigned"}</TableCell>
                        <TableCell className="max-w-80 whitespace-normal text-sm leading-6 text-slate-700">
                          {report.description}
                        </TableCell>
                        <TableCell className="max-w-64 whitespace-normal text-sm leading-6 text-slate-700">
                          {report.action_taken || "No action recorded"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusClass(report.status)}>{statusLabels[report.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-slate-500">
                          {new Date(report.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="w-80 pr-4 sm:pr-6">
                          <div className="space-y-3">
                            <select
                              value={statusDrafts[report.id] || report.status}
                              onChange={(event) =>
                                setStatusDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [report.id]: event.target.value as ReviewStatus,
                                }))
                              }
                              disabled={isSaving}
                              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
                              aria-label={`Status for ${incidentLabels[report.incident_type]}`}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {statusLabels[status]}
                                </option>
                              ))}
                            </select>
                            <textarea
                              value={noteDrafts[report.id] || ""}
                              onChange={(event) =>
                                setNoteDrafts((currentDrafts) => ({
                                  ...currentDrafts,
                                  [report.id]: event.target.value,
                                }))
                              }
                              disabled={isSaving}
                              className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600"
                              placeholder="Admin notes"
                              aria-label={`Admin notes for ${incidentLabels[report.incident_type]}`}
                            />
                            <Button
                              type="button"
                              onClick={() => void updateReport(report)}
                              disabled={isSaving}
                              className="h-10 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700"
                            >
                              {isSaving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              Save review
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
