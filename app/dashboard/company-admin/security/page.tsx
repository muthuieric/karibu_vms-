"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Ban, CalendarClock, CheckCircle2, ClipboardCheck, Eye, Flag, Loader2, Plus, RefreshCw, ShieldAlert, ShieldCheck, X } from "lucide-react";
import PhoneInput from "react-phone-input-2";

import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/dashboard/shared/StateBlocks";
import { ModalShell } from "@/components/dashboard/shared/ModalShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCompanyBlacklist, type RedFlag, type RedFlagForm } from "@/hooks/useCompanyBlacklist";
import { getAuthHeaders } from "@/lib/client-auth";
import "react-phone-input-2/lib/style.css";

type IncidentType = "visitor_related" | "gate_issue" | "restricted_attempt" | "suspicious_activity" | "property_issue" | "emergency" | "other";
type Urgency = "low" | "normal" | "high" | "critical";
type ReviewStatus = "pending_review" | "reviewed" | "dismissed" | "linked_to_restriction";
type IncidentFilter = "all" | ReviewStatus;
type Relation<T> = T | T[] | null;

type IncidentReport = {
  id: string;
  visitor_id: string | null;
  gate_id: string | null;
  red_flag_id?: string | null;
  incident_type: IncidentType;
  urgency: Urgency;
  description: string;
  action_taken: string | null;
  status: ReviewStatus;
  admin_notes: string | null;
  created_at: string;
  visitors: Relation<{ name: string | null; phone: string | null; id_number: string | null; vehicle_reg?: string | null; purpose?: string | null }>;
  gates: Relation<{ name: string | null }>;
  reporter: Relation<{ full_name: string | null; role: string | null }>;
};

const tabs = ["Incident Reports", "Restricted Visitors"] as const;
const incidentFilters: { value: IncidentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_review", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "dismissed", label: "Dismissed" },
  { value: "linked_to_restriction", label: "Linked to Restriction" },
];
const incidentLabels: Record<IncidentType, string> = {
  visitor_related: "Visitor related",
  gate_issue: "Entry point issue",
  restricted_attempt: "Restricted attempt",
  suspicious_activity: "Suspicious activity",
  property_issue: "Property issue",
  emergency: "Emergency",
  other: "Other",
};
const urgencyLabels: Record<Urgency, string> = { low: "Low", normal: "Normal", high: "High", critical: "Critical" };
const statusLabels: Record<ReviewStatus, string> = {
  pending_review: "Pending review",
  reviewed: "Reviewed",
  dismissed: "Dismissed",
  linked_to_restriction: "Linked to restriction",
};
const blankRestriction: RedFlagForm = {
  name: "",
  id_number: "",
  phone: "",
  vehicle_reg: "",
  reason: "",
  reason_category: "security_incident",
  review_months: "6",
  expires_months: "24",
};

const redFlagStatusLabels: Record<string, string> = {
  active: "Active",
  expired: "Expired",
  removed: "Removed",
  deleted: "Removed",
};

const reasonCategoryLabels: Record<string, string> = {
  security_incident: "Security incident",
  access_violation: "Access violation",
  management_directive: "Management directive",
  safety_concern: "Safety concern",
};

function firstRelation<T>(relation: Relation<T>): T | null {
  if (Array.isArray(relation)) return relation[0] || null;
  return relation;
}

function priorityVariant(urgency: Urgency) {
  if (urgency === "critical") return "error";
  if (urgency === "high") return "pending";
  if (urgency === "low") return "secondary";
  return "info";
}

function statusVariant(status: ReviewStatus) {
  if (status === "reviewed") return "success";
  if (status === "dismissed") return "secondary";
  if (status === "linked_to_restriction") return "error";
  return "pending";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDateOnly(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function formatLabel(value?: string | null, labels?: Record<string, string>) {
  if (!value) return "Not set";
  if (labels?.[value]) return labels[value];
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatLast4(value?: string | null) {
  return value ? `••••${value}` : "Not provided";
}

function hasRestrictionIdentifier(form: RedFlagForm) {
  const phoneDigits = form.phone.replace(/\D/g, "");
  return Boolean(form.id_number.trim() || form.vehicle_reg.trim() || (phoneDigits && phoneDigits !== "254"));
}

function visitorIdentifierSummary(visitor: { phone: string | null; id_number: string | null } | null) {
  if (!visitor) return undefined;
  return [visitor.phone, visitor.id_number ? `ID ${visitor.id_number}` : null].filter(Boolean).join(" / ") || undefined;
}

export default function CompanyAdminSecurityPage() {
  const restrictedVisitors = useCompanyBlacklist();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Incident Reports");
  const [incidentFilter, setIncidentFilter] = useState<IncidentFilter>("pending_review");
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [restrictionReport, setRestrictionReport] = useState<IncidentReport | null>(null);
  const [restrictionForm, setRestrictionForm] = useState<RedFlagForm>(blankRestriction);
  const [restrictionError, setRestrictionError] = useState<string | null>(null);
  const [submittingRestriction, setSubmittingRestriction] = useState(false);
  const [showAddRestriction, setShowAddRestriction] = useState(false);
  const [selectedRestriction, setSelectedRestriction] = useState<RedFlag | null>(null);

  const loadReports = useCallback(async () => {
    setIncidentError(null);
    setLoadingReports(true);
    try {
      const response = await fetch("/api/incident-reports", { cache: "no-store", headers: await getAuthHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Incident reports could not be loaded.");
      setReports((result.data || []) as IncidentReport[]);
    } catch (error) {
      setIncidentError(error instanceof Error ? error.message : "Incident reports could not be loaded.");
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(
    () => (incidentFilter === "all" ? reports : reports.filter((report) => report.status === incidentFilter)),
    [incidentFilter, reports]
  );

  const incidentCounts = useMemo(() => ({
    all: reports.length,
    pending_review: reports.filter((report) => report.status === "pending_review").length,
    reviewed: reports.filter((report) => report.status === "reviewed").length,
    dismissed: reports.filter((report) => report.status === "dismissed").length,
    linked_to_restriction: reports.filter((report) => report.status === "linked_to_restriction").length,
  }), [reports]);

  const updateIncident = async (report: IncidentReport, status: ReviewStatus, adminNotes?: string | null, redFlagId?: string | null) => {
    setSavingId(report.id);
    setIncidentError(null);
    try {
      const response = await fetch("/api/incident-reports", {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          id: report.id,
          status,
          admin_notes: adminNotes ?? report.admin_notes,
          red_flag_id: redFlagId || undefined,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Incident report could not be updated.");
      setReports((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, status, admin_notes: adminNotes ?? report.admin_notes, red_flag_id: redFlagId ?? item.red_flag_id } : item
        )
      );
    } catch (error) {
      setIncidentError(error instanceof Error ? error.message : "Incident report could not be updated.");
    } finally {
      setSavingId(null);
    }
  };

  const openRestrictionModal = (report: IncidentReport) => {
    const visitor = firstRelation(report.visitors);
    setRestrictionError(null);
    setRestrictionReport(report);
    setRestrictionForm({
      ...blankRestriction,
      name: visitor?.name || "",
      phone: visitor?.phone || "",
      id_number: visitor?.id_number || "",
      vehicle_reg: visitor?.vehicle_reg || "",
      reason: report.description,
    });
  };

  const submitIncidentRestriction = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!restrictionReport) return;
    setRestrictionError(null);

    if (!hasRestrictionIdentifier(restrictionForm)) {
      setRestrictionError("This visitor has missing identifier details. Add at least one identifier before restricting.");
      return;
    }

    setSubmittingRestriction(true);
    try {
      const redFlag = await restrictedVisitors.createRedFlag(restrictionForm);
      const note = `Linked to restricted visitor record from incident report on ${new Date().toLocaleDateString()}.`;
      await updateIncident(restrictionReport, "linked_to_restriction", note, redFlag.id);
      await restrictedVisitors.fetchData();
      setRestrictionReport(null);
    } catch (error) {
      setRestrictionError(error instanceof Error ? error.message : "Restricted visitor record could not be created.");
    } finally {
      setSubmittingRestriction(false);
    }
  };

  if (!restrictedVisitors.companyId && !restrictedVisitors.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <ErrorState title="Profile Error" description="Could not verify your building manager profile. Please log in again." />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background p-4 pb-20 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader title="Security Center" description="Review access reports and manage restricted visitors." icon={ShieldCheck} tone="warning">
          <Button type="button" variant="outline" onClick={() => void loadReports()} disabled={loadingReports} className="w-full sm:w-auto">
            {loadingReports ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
        </PageHeader>

        <div className="rounded-[1.4rem] border border-slate-100 bg-white p-2 shadow-sm">
          <div className="grid gap-2 sm:inline-grid sm:grid-cols-2">
            {tabs.map((tab) => (
              <Button key={tab} type="button" variant={activeTab === tab ? "default" : "ghost"} onClick={() => setActiveTab(tab)} className="justify-center">
                {tab === "Incident Reports" ? <ClipboardCheck className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === "Incident Reports" ? (
          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Incident Reports</CardTitle>
                  <CardDescription>Guard-submitted access reports awaiting admin action.</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="pending">{incidentCounts.pending_review} pending</Badge>
                  <Badge variant="error">{incidentCounts.linked_to_restriction} linked</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="flex flex-wrap gap-2">
                {incidentFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    type="button"
                    size="sm"
                    variant={incidentFilter === filter.value ? "default" : "outline"}
                    onClick={() => setIncidentFilter(filter.value)}
                  >
                    {filter.label}
                    <span className="rounded-full bg-white/20 px-1.5 text-xs font-black">
                      {filter.value === "all" ? incidentCounts.all : incidentCounts[filter.value]}
                    </span>
                  </Button>
                ))}
              </div>

              {incidentError && (
                <div className="flex gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{incidentError}</span>
                </div>
              )}

              {loadingReports ? (
                <LoadingSkeleton rows={5} />
              ) : reports.length === 0 ? (
                <EmptyState title="No incident reports" description="Submitted access reports will appear here for admin review." icon={ShieldAlert} />
              ) : filteredReports.length === 0 ? (
                <EmptyState title="No matching reports" description="Try another incident status filter." icon={ShieldAlert} />
              ) : (
                filteredReports.map((report) => {
                  const visitor = firstRelation(report.visitors);
                  const gate = firstRelation(report.gates);
                  const reporter = firstRelation(report.reporter);
                  const isSaving = savingId === report.id;
                  const isPending = report.status === "pending_review";

                  return (
                    <div key={report.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={priorityVariant(report.urgency)}>{urgencyLabels[report.urgency]}</Badge>
                            <Badge variant={statusVariant(report.status)}>{statusLabels[report.status]}</Badge>
                            <span className="text-sm font-black text-slate-900">{incidentLabels[report.incident_type]}</span>
                          </div>

                          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <InfoItem label="Visitor" value={visitor?.name || "General report"} subvalue={visitorIdentifierSummary(visitor)} />
                            <InfoItem label="Gate" value={gate?.name || "Unassigned"} />
                            <InfoItem label="Reported by" value={reporter?.full_name || "Security team"} />
                            <InfoItem label="Created" value={formatDate(report.created_at)} />
                          </div>

                          <div className="grid gap-3 lg:grid-cols-2">
                            <TextBlock label="Description" value={report.description} />
                            <TextBlock label="Guard note" value={report.action_taken || "No guard note recorded"} />
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-52 lg:flex-col">
                          {isPending ? (
                            <>
                              <Button type="button" onClick={() => void updateIncident(report, "reviewed")} disabled={isSaving} className="flex-1">
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                Mark Reviewed
                              </Button>
                              <Button type="button" variant="outline" onClick={() => void updateIncident(report, "dismissed")} disabled={isSaving} className="flex-1">
                                <X className="h-4 w-4" />
                                Dismiss
                              </Button>
                              {report.visitor_id && visitor && (
                                <Button type="button" variant="destructive" onClick={() => openRestrictionModal(report)} disabled={isSaving} className="flex-1">
                                  <Ban className="h-4 w-4" />
                                  Restrict Visitor
                                </Button>
                              )}
                            </>
                          ) : report.status === "linked_to_restriction" ? (
                            <Button type="button" variant="destructive" disabled className="flex-1">
                              <Ban className="h-4 w-4" />
                              Already Restricted
                            </Button>
                          ) : (
                            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm font-bold text-slate-600">
                              Final decision recorded
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        ) : (
          <RestrictedVisitorsTab
            blacklist={restrictedVisitors}
            reports={reports}
            onAdd={() => setShowAddRestriction(true)}
            onViewDetails={setSelectedRestriction}
          />
        )}
      </div>

      {(restrictionReport || showAddRestriction) && (
        <RestrictionModal
          form={restrictionReport ? restrictionForm : restrictedVisitors.newRedFlag}
          setForm={restrictionReport ? setRestrictionForm : restrictedVisitors.setNewRedFlag}
          error={restrictionError}
          submitting={restrictionReport ? submittingRestriction : restrictedVisitors.isSubmittingRedFlag}
          missingIdentifier={Boolean(restrictionReport && !hasRestrictionIdentifier(restrictionForm))}
          title={restrictionReport ? "Restrict visitor from incident" : "Restrict visitor"}
          description="This visitor should not be allowed entry."
          onClose={() => {
            setRestrictionReport(null);
            setShowAddRestriction(false);
            setRestrictionError(null);
          }}
          onSubmit={restrictionReport ? submitIncidentRestriction : (event) => restrictedVisitors.handleCreateRedFlag(event, () => setShowAddRestriction(false))}
        />
      )}

      {selectedRestriction && (
        <RestrictedVisitorDetailsModal
          redFlag={selectedRestriction}
          linkedIncident={reports.find((report) => report.red_flag_id === selectedRestriction.id) || null}
          onClose={() => setSelectedRestriction(null)}
        />
      )}
    </div>
  );
}

function InfoItem({ label, value, subvalue }: { label: string; value: string; subvalue?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words font-bold text-slate-900">{value}</p>
      {subvalue && <p className="mt-1 break-words text-xs font-semibold text-slate-500">{subvalue}</p>}
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function redFlagLast4(flag: RedFlag, field: "phone" | "id_number" | "vehicle_reg") {
  const last4 = field === "phone" ? flag.phone_last4 : field === "id_number" ? flag.id_number_last4 : flag.vehicle_reg_last4;
  if (last4) return formatLast4(last4);

  const maskedValue = field === "phone" ? flag.phone : field === "id_number" ? flag.id_number : flag.vehicle_reg;
  return maskedValue || "Not provided";
}

function redFlagIdentifierSummary(flag: RedFlag) {
  const identifiers = [
    `Phone ${redFlagLast4(flag, "phone")}`,
    `ID ${redFlagLast4(flag, "id_number")}`,
    `Vehicle ${redFlagLast4(flag, "vehicle_reg")}`,
  ].filter((value) => !value.endsWith("Not provided"));

  return identifiers.length > 0 ? identifiers.join(" / ") : "No identifiers";
}

function RestrictedVisitorsTab({
  blacklist,
  reports,
  onAdd,
  onViewDetails,
}: {
  blacklist: ReturnType<typeof useCompanyBlacklist>;
  reports: IncidentReport[];
  onAdd: () => void;
  onViewDetails: (redFlag: RedFlag) => void;
}) {
  return (
    <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl font-black text-slate-900">Restricted Visitors</CardTitle>
            <CardDescription>This visitor should not be allowed entry.</CardDescription>
          </div>
          <Button type="button" variant="destructive" onClick={onAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Restricted Visitor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {blacklist.identifierWarning && (
          <div className="m-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950 sm:m-0 sm:mb-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <span>Restricted visitor matching requires at least one identifier such as phone, ID/passport, or vehicle registration.</span>
          </div>
        )}
        {blacklist.loading ? (
          <div className="p-5"><LoadingSkeleton rows={4} /></div>
        ) : blacklist.redFlags.length === 0 ? (
          <div className="p-5"><EmptyState title="No visitors restricted" description="Restricted visitor records will appear here." icon={Flag} /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="pl-4 sm:pl-6">Name</TableHead>
                  <TableHead>Identifier summary</TableHead>
                  <TableHead>Reason category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Review date</TableHead>
                  <TableHead>Expiry date</TableHead>
                  <TableHead>Created date</TableHead>
                  <TableHead className="pr-4 text-right sm:pr-6">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blacklist.redFlags.map((flag) => {
                  const linkedIncident = reports.find((report) => report.red_flag_id === flag.id);

                  return (
                    <TableRow key={flag.id}>
                      <TableCell className="pl-4 font-bold text-slate-900 sm:pl-6">{flag.name}</TableCell>
                      <TableCell className="min-w-[260px] font-mono text-slate-600">{redFlagIdentifierSummary(flag)}</TableCell>
                      <TableCell className="text-slate-600">{formatLabel(flag.reason_category, reasonCategoryLabels)}</TableCell>
                      <TableCell><Badge variant={flag.status === "active" ? "success" : "secondary"}>{formatLabel(flag.status, redFlagStatusLabels)}</Badge></TableCell>
                      <TableCell className="text-slate-600">{formatDateOnly(flag.review_at)}</TableCell>
                      <TableCell className="text-slate-600">{formatDateOnly(flag.expires_at)}</TableCell>
                      <TableCell className="text-slate-600">{formatDateOnly(flag.created_at)}</TableCell>
                      <TableCell className="pr-4 text-right sm:pr-6">
                        <Button type="button" variant="outline" size="sm" onClick={() => onViewDetails(flag)} aria-label={`View restriction details for ${flag.name}`}>
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View Details</span>
                        </Button>
                        {linkedIncident && <span className="sr-only">Linked to {incidentLabels[linkedIncident.incident_type]} from {formatDate(linkedIncident.created_at)}</span>}
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

function RestrictedVisitorDetailsModal({
  redFlag,
  linkedIncident,
  onClose,
}: {
  redFlag: RedFlag;
  linkedIncident: IncidentReport | null;
  onClose: () => void;
}) {
  const incidentVisitor = linkedIncident ? firstRelation(linkedIncident.visitors) : null;
  const incidentGate = linkedIncident ? firstRelation(linkedIncident.gates) : null;
  const incidentReporter = linkedIncident ? firstRelation(linkedIncident.reporter) : null;

  return (
    <ModalShell
      title="Restricted visitor details"
      description="This visitor should not be allowed entry."
      onClose={onClose}
      className="max-w-2xl"
      footer={
        <div className="flex w-full justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <DetailItem label="Name" value={redFlag.name} />
          <DetailItem label="Status" value={formatLabel(redFlag.status, redFlagStatusLabels)} />
          <DetailItem label="Phone last 4" value={redFlagLast4(redFlag, "phone")} />
          <DetailItem label="ID last 4" value={redFlagLast4(redFlag, "id_number")} />
          <DetailItem label="Vehicle last 4" value={redFlagLast4(redFlag, "vehicle_reg")} />
          <DetailItem label="Reason category" value={formatLabel(redFlag.reason_category, reasonCategoryLabels)} />
          <DetailItem label="Review date" value={formatDateOnly(redFlag.review_at)} />
          <DetailItem label="Expiry date" value={formatDateOnly(redFlag.expires_at)} />
          <DetailItem label="Created date" value={formatDateOnly(redFlag.created_at)} />
        </div>

        <TextBlock label="Full reason/details" value={redFlag.reason || "No details recorded"} />

        {linkedIncident ? (
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={statusVariant(linkedIncident.status)}>{statusLabels[linkedIncident.status]}</Badge>
              <Badge variant={priorityVariant(linkedIncident.urgency)}>{urgencyLabels[linkedIncident.urgency]}</Badge>
              <span className="text-sm font-black text-slate-900">{incidentLabels[linkedIncident.incident_type]}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailItem label="Incident type" value={incidentLabels[linkedIncident.incident_type]} />
              <DetailItem label="Date/time" value={formatDate(linkedIncident.created_at)} />
              <DetailItem label="Gate" value={incidentGate?.name || "Unassigned"} />
              <DetailItem label="Reported by" value={incidentReporter?.full_name || "Security team"} />
              <DetailItem label="Priority" value={urgencyLabels[linkedIncident.urgency]} />
              <DetailItem label="Status" value={statusLabels[linkedIncident.status]} />
              <DetailItem label="Visit purpose" value={incidentVisitor?.purpose || "Not recorded"} />
            </div>
            <TextBlock label="Incident description" value={linkedIncident.description} />
            <TextBlock label="Incident guard note" value={linkedIncident.action_taken || "No guard note recorded"} />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm font-semibold text-slate-600">
            No linked incident information recorded.
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 break-words font-bold text-slate-900">{value}</p>
    </div>
  );
}

function RestrictionModal({
  form,
  setForm,
  error,
  submitting,
  missingIdentifier,
  title,
  description,
  onClose,
  onSubmit,
}: {
  form: RedFlagForm;
  setForm: React.Dispatch<React.SetStateAction<RedFlagForm>>;
  error: string | null;
  submitting: boolean;
  missingIdentifier: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <ModalShell
      title={title}
      description={description}
      onClose={onClose}
      className="max-w-2xl"
      footer={
        <div className="flex w-full flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button type="button" variant="ghost" className="w-full sm:w-auto" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="destructive" className="w-full sm:w-auto" disabled={submitting || missingIdentifier} onClick={() => document.getElementById("restrict-form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            Save Restriction
          </Button>
        </div>
      }
    >
      <form id="restrict-form" onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="flex gap-2 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {missingIdentifier && (
          <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-950" role="status">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>This visitor has missing identifier details. Add at least one identifier before restricting.</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="restriction-name">Visitor Name</Label>
            <Input id="restriction-name" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Visitor name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restriction-id-number">ID Number</Label>
            <Input id="restriction-id-number" value={form.id_number} onChange={(event) => setForm((current) => ({ ...current, id_number: event.target.value }))} placeholder="ID or passport" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restriction-phone">Phone Number</Label>
            <PhoneInput
              inputProps={{ id: "restriction-phone" }}
              country="ke"
              value={form.phone}
              onChange={(phone) => setForm((current) => ({ ...current, phone }))}
              inputClass="!w-full !h-11 !text-slate-900 !bg-white !rounded-xl !border !border-slate-200 focus:!ring-2 focus:!ring-blue-600 px-3"
              containerClass="w-full"
              buttonClass="!border-slate-200 !bg-white !rounded-l-xl hover:!bg-slate-50"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="restriction-vehicle">Vehicle Registration</Label>
            <Input id="restriction-vehicle" value={form.vehicle_reg} onChange={(event) => setForm((current) => ({ ...current, vehicle_reg: event.target.value }))} placeholder="Vehicle registration" className="uppercase" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Reason Category</Label>
            <Select value={form.reason_category || "security_incident"} onValueChange={(value) => setForm((current) => ({ ...current, reason_category: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="security_incident">Security incident</SelectItem>
                <SelectItem value="access_violation">Access violation</SelectItem>
                <SelectItem value="management_directive">Management directive</SelectItem>
                <SelectItem value="safety_concern">Safety concern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="restriction-review">Review date</Label>
            <Select value={form.review_months || "6"} onValueChange={(value) => setForm((current) => ({ ...current, review_months: value }))}>
              <SelectTrigger id="restriction-review"><CalendarClock className="h-4 w-4 text-slate-400" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs font-semibold text-slate-500">When should this restriction be reviewed?</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="restriction-expiry">Expiry date</Label>
            <Select value={form.expires_months || "24"} onValueChange={(value) => setForm((current) => ({ ...current, expires_months: value }))}>
              <SelectTrigger id="restriction-expiry"><CalendarClock className="h-4 w-4 text-slate-400" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
                <SelectItem value="36">36 months</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs font-semibold text-slate-500">When should this restriction end?</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="restriction-reason">Reason / Details</Label>
            <textarea
              id="restriction-reason"
              required
              value={form.reason}
              onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
              placeholder="Reason for restriction"
              className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <Ban className="mr-2 inline h-4 w-4 text-slate-400" />
          This visitor should not be allowed entry. Add at least one strong identifier: phone, ID/passport, or vehicle registration.
        </div>
      </form>
    </ModalShell>
  );
}
