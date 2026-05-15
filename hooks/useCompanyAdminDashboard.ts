"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export type AdminVisitor = {
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
            status: "auto_checked_out",
            checked_out_at: new Date().toISOString(),
          })
          .eq("company_id", profile.company_id)
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Auto-checkout script failed:", err);
      }

      const { data: company } = await supabase
        .from("companies")
        .select("is_locked, custom_fields")
        .eq("id", profile.company_id)
        .single();

      const accountLocked = company?.is_locked === true;
      setIsLocked(accountLocked);

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
        const gatesRes = await fetch(`/api/gates?company_id=${profile.company_id}`);
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

      const matchesStatus = statusFilter === "all" || visitor.status === statusFilter;

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

  const downloadCSV = () => {
    if (filteredVisitors.length === 0) {
      alert("No data available to download.");
      return;
    }

    const customFieldIds = Object.keys(customFieldLabels);
    const customHeaders = customFieldIds.map((id) => customFieldLabels[id]);
    const headers = [
      "Date",
      "Visitor Name",
      "Phone Number",
      "Document Type",
      "ID Number",
      "Host Name",
      "Purpose",
      "Vehicle Reg",
      "Status",
      "Entry Gate",
      "Time In",
      "Time Out",
      ...customHeaders,
    ];

    const csvRows = filteredVisitors.map((visitor) => {
      const date = new Date(visitor.created_at).toLocaleDateString();
      const timeIn = new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const timeOut = visitor.checked_out_at
        ? new Date(visitor.checked_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--";
      const standardData = [
        `"${date}"`,
        `"${visitor.name}"`,
        `"${visitor.phone || "N/A"}"`,
        `"${visitor.document_type || "N/A"}"`,
        `"${visitor.id_number || "N/A"}"`,
        `"${visitor.host_name || "N/A"}"`,
        `"${visitor.purpose || "N/A"}"`,
        `"${visitor.vehicle_reg || "N/A"}"`,
        `"${visitor.status.replace(/_/g, " ").toUpperCase()}"`,
        `"${getGateName(visitor.gate_id)}"`,
        `"${timeIn}"`,
        `"${timeOut}"`,
      ];

      const customData = customFieldIds.map((id) => `"${visitor.custom_data?.[id] || "N/A"}"`);
      return [...standardData, ...customData].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const todayStr = new Date().toISOString().split("T")[0];
    link.setAttribute("download", hasActiveFilters ? `Filtered_Report_${todayStr}.csv` : `Building_Visitor_Log_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return visitors.filter((visitor) => visitor.created_at.startsWith(today)).length;
  }, [visitors]);

  return {
    loading,
    isLocked,
    visitors,
    gates,
    customFieldLabels,
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
    downloadCSV,
  };
}
