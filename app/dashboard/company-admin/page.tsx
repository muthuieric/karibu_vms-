"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminDashboardHeader from "@/components/dashboard/company-admin/AdminDashboardHeader";
import AdminPhotoLightbox from "@/components/dashboard/company-admin/AdminPhotoLightbox";
import AdminStatsGrid from "@/components/dashboard/company-admin/AdminStatsGrid";
import AdminVisitInfoModal from "@/components/dashboard/company-admin/AdminVisitInfoModal";
import MasterVisitorLog from "@/components/dashboard/company-admin/MasterVisitorLog";

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
  host_confirmed?: boolean; // NEW FIELD
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

export default function AdminDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [lifetimeVisitors, setLifetimeVisitors] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Hard block state
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [customFieldLabels, setCustomFieldLabels] = useState<Record<string, string>>({});
   
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gateFilter, setGateFilter] = useState("all"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [infoModalVisitor, setInfoModalVisitor] = useState<Visitor | null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null); 

  useEffect(() => {
    const fetchInitialData = async () => {
      // Auto Checkout Script
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      try {
        await supabase
          .from("visitors")
          .update({ 
            status: "auto_checked_out", 
            checked_out_at: new Date().toISOString() 
          })
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Auto-checkout script failed:", err);
      }

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

      const { data: company } = await supabase
        .from("companies")
        .select("is_locked, custom_fields")
        .eq("id", profile.company_id)
        .single();

      // Only lock if the Superadmin explicitly locked the account in the database
      const accountLocked = company?.is_locked === true;
      setIsLocked(accountLocked);

      // --- IMPENETRABLE SECURITY BLOCK ---
      if (accountLocked) {
        setLoading(false);
        return;
      }

      if (company?.custom_fields) {
        const labelMap: Record<string, string> = {};
        const customFields = company.custom_fields as Array<{ id: string; label: string }>;
        customFields.forEach((f) => {
          labelMap[f.id] = f.label;
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

      // Fetch Visitors
      const { data: visitorData, error: visitorError } = await supabase
        .from("visitors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000);

      if (visitorError) {
        console.error("Error fetching visitors:", visitorError);
      } else {
        setVisitors(visitorData || []);
      }

      const { count: lifetimeCount, error: lifetimeError } = await supabase
        .from("visitors")
        .select("*", { count: "exact", head: true });

      if (!lifetimeError && lifetimeCount !== null) {
        setLifetimeVisitors(lifetimeCount);
      }

      setLoading(false);
    };

    fetchInitialData();

    const channel = supabase
      .channel("admin-dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "visitors" },
        (payload) => {
          if (!isLocked) {
            if (payload.eventType === "INSERT") {
              setVisitors((prev) => [payload.new as Visitor, ...prev]);
              setLifetimeVisitors((prev) => prev + 1); 
            } else if (payload.eventType === "UPDATE") {
              setVisitors((prev) =>
                prev.map((v) => (v.id === payload.new.id ? (payload.new as Visitor) : v))
              );
              // Update modal if the updated visitor is currently being viewed
              setInfoModalVisitor((prev) => 
                prev?.id === payload.new.id ? (payload.new as Visitor) : prev
              );
            } else if (payload.eventType === "DELETE") {
              setVisitors((prev) => prev.filter((v) => v.id !== payload.old.id));
              setLifetimeVisitors((prev) => Math.max(0, prev - 1)); 
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLocked]); 

  // --- HARD RENDER BLOCK ---
  if (isLocked) {
    return null;
  }

  const getGateName = (gateId?: string | null) => {
    if (!gateId) return "Unassigned";
    const gate = gates.find(g => g.id === gateId);
    return gate ? gate.name : "Unknown Gate";
  };

  const filteredVisitors = visitors.filter((v) => {
    const query = searchQuery.toLowerCase();
    
    let matchesSearch = 
      v.name.toLowerCase().includes(query) ||
      v.phone?.includes(query) ||
      (v.id_number && v.id_number.toLowerCase().includes(query)) ||
      (v.host_name && v.host_name.toLowerCase().includes(query)) ||
      (v.vehicle_reg && v.vehicle_reg.toLowerCase().includes(query));

    if (!matchesSearch && v.custom_data) {
      matchesSearch = Object.values(v.custom_data).some(val => 
        val && val.toLowerCase().includes(query)
      );
    }

    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    
    let matchesGate = true;
    if (gateFilter === "unassigned") {
      matchesGate = !v.gate_id;
    } else if (gateFilter !== "all") {
      matchesGate = v.gate_id === gateFilter;
    }

    let matchesDate = true;
    const visitorTime = new Date(v.created_at).getTime();
    
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

  const hasActiveFilters = Boolean(searchQuery || startDate || statusFilter !== "all" || gateFilter !== "all");

  const downloadCSV = () => {
    if (filteredVisitors.length === 0) {
      alert("No data available to download.");
      return;
    }

    const customFieldIds = Object.keys(customFieldLabels);
    const customHeaders = customFieldIds.map(id => customFieldLabels[id]);
    
    const headers = [
      "Date", "Visitor Name", "Phone Number", "Document Type", "ID Number", 
      "Host Name", "Purpose", "Vehicle Reg", "Status", "Entry Gate", "Time In", "Time Out",
      ...customHeaders
    ];
    
    const csvRows = filteredVisitors.map((v) => {
      const date = new Date(v.created_at).toLocaleDateString();
      const timeIn = new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const timeOut = v.checked_out_at ? new Date(v.checked_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--";
      const gateName = getGateName(v.gate_id);
      
      const standardData = [
        `"${date}"`,
        `"${v.name}"`,
        `"${v.phone || 'N/A'}"`,
        `"${v.document_type || 'N/A'}"`,
        `"${v.id_number || 'N/A'}"`,
        `"${v.host_name || 'N/A'}"`,
        `"${v.purpose || 'N/A'}"`,
        `"${v.vehicle_reg || 'N/A'}"`,
        `"${v.status.replace(/_/g, " ").toUpperCase()}"`,
        `"${gateName}"`,
        `"${timeIn}"`,
        `"${timeOut}"`
      ];

      const customData = customFieldIds.map(id => `"${v.custom_data?.[id] || 'N/A'}"`);
      return [...standardData, ...customData].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const todayStr = new Date().toISOString().split('T')[0];
    
    const fileName = hasActiveFilters
      ? `Filtered_Report_${todayStr}.csv` 
      : `Building_Visitor_Log_${todayStr}.csv`;
      
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalToday = visitors.filter(v => {
    const today = new Date().toISOString().split('T')[0];
    return v.created_at.startsWith(today);
  }).length;
  
  const currentlyInside = visitors.filter(v => v.status === "checked_in").length;
  const pendingCount = visitors.filter(v => v.status === "pending").length;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <AdminDashboardHeader
          hasActiveFilters={hasActiveFilters}
          onDownloadCSV={downloadCSV}
        />
        
        <AdminStatsGrid
          totalToday={totalToday}
          currentlyInside={currentlyInside}
          pendingCount={pendingCount}
          lifetimeVisitors={lifetimeVisitors}
        />

        <MasterVisitorLog
          loading={loading}
          visitors={filteredVisitors}
          gates={gates}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          gateFilter={gateFilter}
          startDate={startDate}
          endDate={endDate}
          hasActiveFilters={hasActiveFilters}
          getGateName={getGateName}
          onSearchQueryChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onGateFilterChange={setGateFilter}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onPhotoClick={setEnlargedPhoto}
          onInfoClick={setInfoModalVisitor}
        />
      </div>

      {infoModalVisitor && (
        <AdminVisitInfoModal
          visitor={infoModalVisitor}
          customFieldLabels={customFieldLabels}
          onClose={() => setInfoModalVisitor(null)}
        />
      )}

      {enlargedPhoto && (
        <AdminPhotoLightbox
          photoUrl={enlargedPhoto}
          onClose={() => setEnlargedPhoto(null)}
        />
      )}
    </div>
  );
}
