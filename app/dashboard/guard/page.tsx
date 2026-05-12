"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddVisitorModal from "@/components/dashboard/guard/add-visitor/AddVisitorModal";
import GuardDashboardHeader from "@/components/GuardDashboardHeader";
import GuardStats from "@/components/GuardStats";
import GuardVisitorsTable from "@/components/GuardVisitorsTable";
import GuardQrModal from "@/components/GuardQrModal";
import VisitInfoModal from "@/components/VisitInfoModal";
import PhotoLightbox from "@/components/PhotoLightbox";

type Visitor = {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "checked_in" | "checked_out" | "auto_checked_out";
  created_at: string;
  checked_in_at?: string;
  document_type: string;
  id_number?: string;
  otp_code?: string;
  company_id: string;
  photo_url?: string;
  host_name?: string;
  host_confirmed?: boolean; // NEW: Added host_confirmed
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>; // Holds dynamic form answers
  gate_id?: string | null; // NEW: Added gate_id to track entry point
};

export default function GuardDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State to securely hold the logged-in guard's assigned building/company
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // NEW: State to hold the guard's specific assigned gate
  const [guardGateId, setGuardGateId] = useState<string | null>(null);
  const [guardGateName, setGuardGateName] = useState<string>("All Gates");

  // State to hold our custom field mapping
  const [customFieldLabels, setCustomFieldLabels] = useState<Record<string, string>>({});
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "checked_in">("all");

  // Dynamic Form Rules (Fetched from Admin Settings)
  const [requirePhoto, setRequirePhoto] = useState<boolean>(false);
  const [askPhone, setAskPhone] = useState<boolean>(true);
  const [askId, setAskId] = useState<boolean>(true);
  const [askHost, setAskHost] = useState<boolean>(false);
  const [askPurpose, setAskPurpose] = useState<boolean>(false);
  const [askVehicle, setAskVehicle] = useState<boolean>(false);

  // NEW: State for checking if the account is locked
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // OTP & Request States
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sendingOtpId, setSendingOtpId] = useState<string | null>(null); 
  const [otpInput, setOtpInput] = useState("");

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [infoModalVisitor, setInfoModalVisitor] = useState<Visitor | null>(null);
  
  useEffect(() => {
    const initializeDashboard = async () => {
      // 1. Get the currently logged-in guard's authentication session
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error("Authentication error:", authError);
        setLoading(false);
        return;
      }

      // 2. Look up their assigned company_id AND gate_id in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("company_id, gate_id")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error("Could not load guard profile:", profileError);
        setLoading(false);
        return;
      }

      const currentCompanyId = profileData.company_id;
      const currentGateId = profileData.gate_id;
      
      setCompanyId(currentCompanyId);
      setGuardGateId(currentGateId);

      // 2.5 Fetch the Gate Name if they are assigned to one
      if (currentGateId) {
        const { data: gateData } = await supabase
          .from("gates")
          .select("name")
          .eq("id", currentGateId)
          .single();
          
        if (gateData) setGuardGateName(gateData.name);
      }

      // 3. Fetch company rules & custom fields mapping
      const { data: companyData } = await supabase
        .from("companies")
        .select("require_photo, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle, custom_fields, is_locked, subscription_ends_at")
        .eq("id", currentCompanyId)
        .single();
        
      if (companyData) {
        setRequirePhoto(companyData.require_photo || false);
        setAskPhone(companyData.ask_phone !== false);
        setAskId(companyData.ask_id !== false);
        setAskHost(companyData.ask_host || false);
        setAskPurpose(companyData.ask_purpose || false);
        setAskVehicle(companyData.ask_vehicle || false);

        // CHECK LOCK STATUS
        const isExpired = companyData.subscription_ends_at ? new Date(companyData.subscription_ends_at) < new Date() : false;
        setIsLocked(companyData.is_locked || isExpired);

        if (companyData.custom_fields) {
          const labelMap: Record<string, string> = {};
          const customFields = companyData.custom_fields as Array<{ id: string; label: string }>;
          customFields.forEach((f) => {
            labelMap[f.id] = f.label;
          });
          setCustomFieldLabels(labelMap);
        }
      }

      // AUTO CHECKOUT SCRIPT: Expire OTPs for visitors who forgot to sign out
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      try {
        await supabase
          .from("visitors")
          .update({ 
            status: "auto_checked_out", 
            checked_out_at: new Date().toISOString(),
            otp_code: null // Expire the OTP automatically
          })
          .eq("company_id", currentCompanyId)
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Auto-checkout script failed:", err);
      }

      // 4. Fetch ONLY the visitors for this specific guard's building (AND specific gate if assigned)
      let query = supabase
        .from("visitors")
        .select("*")
        .eq("company_id", currentCompanyId) 
        .gte("created_at", startOfToday.toISOString())
        .in("status", ["pending", "checked_in"])
        .order("created_at", { ascending: false });

      // Apply Gate Filter if the guard is assigned to a specific gate
      if (currentGateId) {
        query = query.eq("gate_id", currentGateId);
      }

      const { data: visitorData, error: visitorError } = await query;

      if (!visitorError) {
        setVisitors(visitorData || []);
      }
      setLoading(false);

      // Set up Real-time listener for instant updates
      const channel = supabase
        .channel("guard-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visitors" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newVisitor = payload.new as Visitor;
              // FILTER REALTIME INSERTS: Only show if unassigned OR if the gate_id matches
              if (!currentGateId || newVisitor.gate_id === currentGateId) {
                setVisitors((prev) => [newVisitor, ...prev]);
              }
            } else if (payload.eventType === "UPDATE") {
              if (payload.new.status === "checked_out" || payload.new.status === "auto_checked_out") {
                setVisitors((prev) => prev.filter((v) => v.id !== payload.new.id));
              } else {
                setVisitors((prev) =>
                  prev.map((v) => (v.id === payload.new.id ? (payload.new as Visitor) : v))
                );
              }
              
              // Update modal if the updated visitor is currently being viewed
              setInfoModalVisitor((prev) => 
                prev?.id === payload.new.id ? (payload.new as Visitor) : prev
              );
            } else if (payload.eventType === "DELETE") {
              setVisitors((prev) => prev.filter((v) => v.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      // Clean up function inside the useEffect block to grab the correct channel scope
      return () => { supabase.removeChannel(channel); };
    };

    const cleanup = initializeDashboard();
    return () => { cleanup.then(fn => fn && fn()); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // --- OTP LOGIC WITH DOUBLE-CLICK PREVENTION ---
  const handleSendOTP = async (id: string, phone: string) => {
    if (sendingOtpId === id) return; 
    
    setSendingOtpId(id); 

    try {
      let code = "";
      let isUnique = false;
      while (!isUnique) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        const { data } = await supabase.from("visitors").select("id").eq("otp_code", code).in("status", ["pending", "checked_in"]);
        if (!data || data.length === 0) isUnique = true; 
      }
      
      await supabase.from("visitors").update({ otp_code: code }).eq("id", id);
      setVerifyingId(id);
      setOtpInput("");

      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phone, 
          message: `Your building entry code is: ${code}` 
        }),
      });
    } catch (err) {
      console.error(err);
      alert(`[SMS API Error] Could not send message. Please try again.`);
    } finally {
      setSendingOtpId(null); 
    }
  };

  const handleConfirmOTP = async (visitor: Visitor) => {
    const { data } = await supabase.from("visitors").select("otp_code").eq("id", visitor.id).single();
    if (!data || data.otp_code !== otpInput.trim()) return alert("Incorrect OTP.");
    
    await supabase.from("visitors").update({ 
      status: "checked_in",
      checked_in_at: new Date().toISOString()
    }).eq("id", visitor.id);
    
    setVerifyingId(null);
  };

  const handleCheckOut = async (id: string) => {
    await supabase.from("visitors").update({ 
      status: "checked_out", 
      checked_out_at: new Date().toISOString(),
      otp_code: null // Expire (delete) the OTP upon checkout
    }).eq("id", id);
  };

  const handlePrintQr = () => {
    const url = `${window.location.origin}/${companyId}/gate${guardGateId ? `?gateId=${guardGateId}` : ''}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
    
    // Open a new window for printing
    const printWindow = window.open('', '', 'width=800,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Gate QR Code</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #18181b; }
              .container { text-align: center; border: 2px dashed #e4e4e7; padding: 40px; border-radius: 24px; max-width: 500px; }
              h1 { margin-bottom: 8px; font-size: 36px; font-weight: 900; letter-spacing: -0.02em; }
              p { color: #71717a; margin-bottom: 32px; font-size: 18px; font-weight: 500; }
              img { width: 300px; height: 300px; display: block; margin: 0 auto; border-radius: 12px; }
              .footer { margin-top: 32px; font-size: 16px; color: #a1a1aa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
              @media print {
                .container { border: none; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Scan to Check In</h1>
              <p>Point your smartphone camera at this code to register your visit.</p>
              <img src="${qrUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
              <div class="footer">${guardGateName}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // --- UI Calculated Variables with Search & Status Filter ---
  const filteredVisitors = visitors.filter((v) => {
    const query = searchTerm.toLowerCase();
    
    let matchesSearch = v.name?.toLowerCase().includes(query) ||
                        v.phone?.includes(searchTerm) ||
                        v.id_number?.includes(searchTerm) ||
                        v.host_name?.toLowerCase().includes(query) ||
                        v.vehicle_reg?.toLowerCase().includes(query);

    // Search within custom fields
    if (!matchesSearch && v.custom_data) {
      matchesSearch = Object.values(v.custom_data).some(val => 
        val && val.toLowerCase().includes(query)
      );
    }

    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const totalToday = visitors.length;
  const checkedInCount = visitors.filter(v => v.status === "checked_in").length;
  const pendingCount = visitors.filter(v => v.status === "pending").length;

  if (!companyId && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-red-600 font-medium">Error: Could not load guard profile. Are you logged in?</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-400/20 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        <GuardDashboardHeader
          guardGateName={guardGateName}
          onLogout={handleLogout}
          onShowQr={() => setShowQrModal(true)}
          onShowAddVisitor={() => setShowAddModal(true)}
        />

        {!isLocked && (
          <GuardStats
            totalToday={totalToday}
            pendingCount={pendingCount}
            checkedInCount={checkedInCount}
          />
        )}

        <GuardVisitorsTable
          loading={loading}
          visitors={filteredVisitors}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          verifyingId={verifyingId}
          sendingOtpId={sendingOtpId}
          otpInput={otpInput}
          onSearchTermChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onPhotoClick={setEnlargedPhoto}
          onInfoClick={setInfoModalVisitor}
          onOtpInputChange={setOtpInput}
          onConfirmOTP={handleConfirmOTP}
          onCancelOTP={() => setVerifyingId(null)}
          onSendOTP={handleSendOTP}
          onCheckOut={handleCheckOut}
        />
      </div>

      <AddVisitorModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        companyId={companyId}
        requirePhoto={requirePhoto}
        askPhone={askPhone}
        askId={askId}
        askHost={askHost}
        askPurpose={askPurpose}
        askVehicle={askVehicle}
        guardGateId={guardGateId}
      />

      {showQrModal && (
        <GuardQrModal
          companyId={companyId}
          guardGateId={guardGateId}
          onClose={() => setShowQrModal(false)}
          onPrintQr={handlePrintQr}
        />
      )}

      {infoModalVisitor && (
        <VisitInfoModal
          visitor={infoModalVisitor}
          customFieldLabels={customFieldLabels}
          onClose={() => setInfoModalVisitor(null)}
        />
      )}

      {enlargedPhoto && (
        <PhotoLightbox
          photoUrl={enlargedPhoto}
          onClose={() => setEnlargedPhoto(null)}
        />
      )}
    </div>
  );
}
