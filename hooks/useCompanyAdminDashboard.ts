"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from "@/lib/client-auth";
import { canUseHostConfirmation, getHostReviewLabel, getVisitorStatusLabel, normalizeVisitorStatus } from "@/lib/visitor-display";

export type AdminVisitor = {
  id: string;
  company_id: string;
  name: string;
  phone: string;
  document_type: string;
  id_number: string;
  status: string;
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

export type AdminGate = {
  id: string;
  name: string;
};

function addVisitorOnce(visitors: AdminVisitor[], visitor: AdminVisitor) {
  if (visitors.some((existing) => existing.id === visitor.id)) {
    return { visitors, added: false };
  }

  return { visitors: [visitor, ...visitors], added: true };
}

export function useCompanyAdminDashboard() {
  const [visitors, setVisitors] = useState<AdminVisitor[]>([]);
  const [gates, setGates] = useState<AdminGate[]>([]);
  const [lifetimeVisitors, setLifetimeVisitors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [planTier, setPlanTier] = useState("basic");
  const [companyName, setCompanyName] = useState("");
  const [customFieldLabels, setCustomFieldLabels] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gateFilter, setGateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const visitorIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let activeCompanyId: string | null = null;

    const fetchInitialData = async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (!profile?.company_id) {
        setLoading(false);
        return;
      }
      activeCompanyId = profile.company_id;

      try {
        await supabase
          .from("visitors")
          .update({
            status: "checked_out",
            checked_out_at: new Date().toISOString(),
          })
          .eq("company_id", profile.company_id)
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Visitor status rollover failed:", err);
      }

      const { data: company } = await supabase
        .from("companies")
        .select("name, is_locked, custom_fields, plan_tier")
        .eq("id", profile.company_id)
        .single();

      const accountLocked = company?.is_locked === true;
      setIsLocked(accountLocked);
      setCompanyName(company?.name || "");
      setPlanTier(company?.plan_tier || "basic");

      if (accountLocked) {
        setLoading(false);
        return;
      }

      if (company?.custom_fields) {
        const labelMap: Record<string, string> = {};
        const customFields = company.custom_fields as Array<{ id: string; label: string }>;
        customFields.forEach((field) => {
          labelMap[field.id] = field.label;
        });
        setCustomFieldLabels(labelMap);
      }

      try {
        const gatesRes = await fetch(`/api/gates?company_id=${profile.company_id}`, { headers: await getAuthHeaders() });
        if (gatesRes.ok) {
          const gatesJson = await gatesRes.json();
          if (gatesJson.data) setGates(gatesJson.data);
        }
      } catch (error) {
        console.error("Error fetching gates:", error);
      }

      const { data: visitorData, error: visitorError } = await supabase
        .from("visitors")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false })
        .limit(2000);

      if (visitorError) {
        console.error("Error fetching visitors:", visitorError);
      } else {
        const initialVisitors = visitorData || [];
        visitorIdsRef.current = new Set(initialVisitors.map((visitor) => visitor.id));
        setVisitors(initialVisitors);
      }

      const { count: lifetimeCount, error: lifetimeError } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true })
        .eq("company_id", profile.company_id);

      if (!lifetimeError && lifetimeCount !== null) {
        setLifetimeVisitors(lifetimeCount);
      }

      setLoading(false);
    };

    fetchInitialData();

    const channel = supabase
      .channel("admin-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, (payload) => {
        if (isLocked) return;

        if (payload.eventType === "INSERT") {
          const newVisitor = payload.new as AdminVisitor;
          if (!activeCompanyId || newVisitor.company_id !== activeCompanyId) return;
          if (visitorIdsRef.current.has(newVisitor.id)) return;
          visitorIdsRef.current.add(newVisitor.id);
          setVisitors((prev) => addVisitorOnce(prev, newVisitor).visitors);
          setLifetimeVisitors((prev) => prev + 1);
        } else if (payload.eventType === "UPDATE") {
          if (!activeCompanyId || (payload.new as AdminVisitor).company_id !== activeCompanyId) return;
          setVisitors((prev) =>
            prev.map((visitor) => (visitor.id === payload.new.id ? (payload.new as AdminVisitor) : visitor))
          );
        } else if (payload.eventType === "DELETE") {
          visitorIdsRef.current.delete(payload.old.id as string);
          setVisitors((prev) => prev.filter((visitor) => visitor.id !== payload.old.id));
          setLifetimeVisitors((prev) => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLocked]);

  const getGateName = (gateId?: string | null) => {
    if (!gateId) return "Unassigned";
    const gate = gates.find((item) => item.id === gateId);
    return gate ? gate.name : "Unknown Gate";
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((visitor) => {
      const query = searchQuery.toLowerCase();

      let matchesSearch =
        visitor.name.toLowerCase().includes(query) ||
        visitor.phone?.includes(query) ||
        (visitor.id_number && visitor.id_number.toLowerCase().includes(query)) ||
        (visitor.host_name && visitor.host_name.toLowerCase().includes(query)) ||
        (visitor.vehicle_reg && visitor.vehicle_reg.toLowerCase().includes(query));

      if (!matchesSearch && visitor.custom_data) {
        matchesSearch = Object.values(visitor.custom_data).some(
          (value) => value && value.toLowerCase().includes(query)
        );
      }

      const matchesStatus = statusFilter === "all" || normalizeVisitorStatus(visitor.status) === statusFilter;

      let matchesGate = true;
      if (gateFilter === "unassigned") {
        matchesGate = !visitor.gate_id;
      } else if (gateFilter !== "all") {
        matchesGate = visitor.gate_id === gateFilter;
      }

      let matchesDate = true;
      const visitorTime = new Date(visitor.created_at).getTime();

      if (startDate) {
        const start = new Date(startDate).getTime();
        if (visitorTime < start) matchesDate = false;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (visitorTime > end.getTime()) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesDate && matchesGate;
    });
  }, [endDate, gateFilter, searchQuery, startDate, statusFilter, visitors]);

  const hasActiveFilters = Boolean(searchQuery || startDate || statusFilter !== "all" || gateFilter !== "all");

  const getStatusLabel = (status: string, isOverride?: boolean) => getVisitorStatusLabel(status, isOverride);

  const exportVisitorsToPdf = () => {
    if (filteredVisitors.length === 0) {
      alert("No data available to download.");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const exportDate = new Date();
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;

    const statusCounts = filteredVisitors.reduce<Record<string, number>>((counts, visitor) => {
      const status = normalizeVisitorStatus(visitor.status);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    const showHostReview = canUseHostConfirmation(planTier);

    const filterSummary = [
      `Search: ${searchQuery || "All"}`,
      `Status: ${statusFilter === "all" ? "All" : getStatusLabel(statusFilter)}`,
      `Date range: ${startDate || "Any"} to ${endDate || "Any"}`,
      `Gate: ${gateFilter === "all" ? "All" : gateFilter === "unassigned" ? "Unassigned" : getGateName(gateFilter)}`,
    ];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("Karibu VMS Entry Records", margin, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    if (companyName) {
      doc.text(companyName, margin, 62);
    }
    doc.text(`Exported ${exportDate.toLocaleString()}`, margin, companyName ? 78 : 62);

    autoTable(doc, {
      startY: 96,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { font: "helvetica", fontSize: 9, cellPadding: 4, textColor: [15, 23, 42] },
      body: [
        ["Total records exported", filteredVisitors.length.toLocaleString()],
        ["Inside", (statusCounts.checked_in || 0).toLocaleString()],
        ["Departed", (statusCounts.checked_out || 0).toLocaleString()],
        ["Pending", (statusCounts.pending || 0).toLocaleString()],
      ],
      columnStyles: {
        0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 130 },
        1: { fontStyle: "bold", textColor: [15, 23, 42] },
      },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
        ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12
        : 174,
      margin: { left: margin, right: margin },
      theme: "plain",
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 3, textColor: [100, 116, 139] },
      body: filterSummary.map((item) => [item]),
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
        ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16
        : 214,
      margin: { left: margin, right: margin },
      head: [[
        "Visitor name",
        "Phone",
        "Host / department",
        ...(showHostReview ? ["Host review"] : []),
        "Purpose",
        "Gate",
        "Status",
        "Check-in",
        "Check-out",
        "Created",
      ]],
      body: filteredVisitors.map((visitor) => {
        const isOverride = visitor.custom_data?.manual_override === "true";

        return [
          visitor.name || "N/A",
          visitor.phone || "N/A",
          visitor.host_name || "N/A",
          ...(showHostReview ? [visitor.host_name ? getHostReviewLabel(visitor.host_confirmed) : "N/A"] : []),
          visitor.purpose || "N/A",
          getGateName(visitor.gate_id),
          getStatusLabel(visitor.status, isOverride),
          new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          visitor.checked_out_at
            ? new Date(visitor.checked_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--",
          new Date(visitor.created_at).toLocaleDateString(),
        ];
      }),
      theme: "grid",
      headStyles: {
        fillColor: [239, 246, 255],
        textColor: [37, 99, 235],
        fontStyle: "bold",
        lineColor: [191, 219, 254],
        lineWidth: 0.5,
      },
      bodyStyles: { textColor: [15, 23, 42] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 5,
        overflow: "linebreak",
        valign: "top",
        lineColor: [226, 232, 240],
        lineWidth: 0.4,
      },
      columnStyles: {
        0: { cellWidth: 82 },
        1: { cellWidth: 66 },
        2: { cellWidth: 84 },
        3: { cellWidth: showHostReview ? 78 : 122 },
        4: { cellWidth: showHostReview ? 104 : 76 },
        5: { cellWidth: showHostReview ? 68 : 72 },
        6: { cellWidth: showHostReview ? 66 : 62 },
        7: { cellWidth: showHostReview ? 58 : 62 },
        8: { cellWidth: showHostReview ? 58 : 68 },
        ...(showHostReview ? { 9: { cellWidth: 62 } } : {}),
      },
      didDrawPage: () => {
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 18, { align: "right" });
        doc.text("Karibu VMS", margin, pageHeight - 18);
      },
    });

    doc.save(hasActiveFilters ? `Filtered_Entry_Records_${todayStr}.pdf` : `Entry_Records_${todayStr}.pdf`);
  };

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return visitors.filter((visitor) => visitor.created_at.startsWith(today)).length;
  }, [visitors]);

  return {
    loading,
    isLocked,
    planTier,
    visitors,
    gates,
    customFieldLabels,
    companyName,
    filteredVisitors,
    lifetimeVisitors,
    totalToday,
    currentlyInside: visitors.filter((visitor) => visitor.status === "checked_in").length,
    pendingCount: visitors.filter((visitor) => visitor.status === "pending").length,
    searchQuery,
    statusFilter,
    gateFilter,
    startDate,
    endDate,
    hasActiveFilters,
    setSearchQuery,
    setStatusFilter,
    setGateFilter,
    setStartDate,
    setEndDate,
    getGateName,
    exportVisitorsToPdf,
  };
}
