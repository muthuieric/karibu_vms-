"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { filterGuardVisitors, getDynamicGateQrUrl, printGateQrPoster } from "@/lib/guard-dashboard";
import type { CustomField, Visitor } from "@/types/guard";

import GuardDashboardHeader from "@/components/GuardDashboardHeader";
import GuardProfileErrorState from "@/components/GuardProfileErrorState";
import GuardStats from "@/components/GuardStats";
import GuardVisitorsTable from "@/components/GuardVisitorsTable";

const AddVisitorModal = dynamic(() => import("@/components/dashboard/guard/add-visitor/AddVisitorModal"), { ssr: false });
const GuardQrModal = dynamic(() => import("@/components/dashboard/guard/GuardQrModal"), { ssr: false });
const VisitInfoModal = dynamic(() => import("@/components/dashboard/guard/VisitInfoModal"), { ssr: false });
const PhotoLightbox = dynamic(() => import("@/components/dashboard/guard/PhotoLightbox"), { ssr: false });

export default function GuardDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [planTier, setPlanTier] = useState<string>("basic");
  const [guardGateId, setGuardGateId] = useState<string | null>(null);
  const [guardGateName, setGuardGateName] = useState<string>("All Gates");
  const [customFieldLabels, setCustomFieldLabels] = useState<Record<string, string>>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "checked_in">("all");

  const [requirePhoto, setRequirePhoto] = useState<boolean>(false);
  const [askPhone, setAskPhone] = useState<boolean>(true);
  const [askId, setAskId] = useState<boolean>(true);
  const [askHost, setAskHost] = useState<boolean>(false);
  const [askPurpose, setAskPurpose] = useState<boolean>(false);
  const [askVehicle, setAskVehicle] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sendingOtpId, setSendingOtpId] = useState<string | null>(null); 
  const [otpInput, setOtpInput] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [infoModalVisitor, setInfoModalVisitor] = useState<Visitor | null>(null);
  
  const [qrTimestamp, setQrTimestamp] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrModal) {
      interval = setInterval(() => {
        setQrTimestamp(Date.now()); 
      }, 300000); 
    }
    return () => clearInterval(interval);
  }, [showQrModal]);
  
  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error("Authentication error:", authError);
        setLoading(false);
        return;
      }

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

      if (currentGateId) {
        const { data: gateData } = await supabase
          .from("gates")
          .select("name")
          .eq("id", currentGateId)
          .single();
          
        if (gateData) setGuardGateName(gateData.name);
      }

      const { data: companyData } = await supabase
        .from("companies")
        .select("name, require_photo, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle, custom_fields, is_locked, subscription_ends_at, plan_tier")
        .eq("id", currentCompanyId)
        .single();
        
      if (companyData) {
        setCompanyName(companyData.name || "");
        setPlanTier(companyData.plan_tier || "basic");
        setRequirePhoto(companyData.require_photo || false);
        setAskPhone(companyData.ask_phone !== false);
        setAskId(companyData.ask_id !== false);
        setAskHost(companyData.ask_host || false);
        setAskPurpose(companyData.ask_purpose || false);
        setAskVehicle(companyData.ask_vehicle || false);

        const isExpired = companyData.subscription_ends_at ? new Date(companyData.subscription_ends_at) < new Date() : false;
        setIsLocked(companyData.is_locked || isExpired);

        if (companyData.custom_fields) {
          const labelMap: Record<string, string> = {};
          const fields = Array.isArray(companyData.custom_fields)
            ? (companyData.custom_fields as CustomField[])
            : [];
          fields.forEach((f) => {
            labelMap[f.id] = f.label;
          });
          setCustomFieldLabels(labelMap);
        }
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      try {
        await supabase
          .from("visitors")
          .update({ 
            status: "auto_checked_out", 
            checked_out_at: new Date().toISOString(),
            otp_code: null
          })
          .eq("company_id", currentCompanyId)
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Auto-checkout script failed:", err);
      }

      let query = supabase
        .from("visitors")
        .select("*")
        .eq("company_id", currentCompanyId) 
        .gte("created_at", startOfToday.toISOString())
        .in("status", ["pending", "checked_in"])
        .order("created_at", { ascending: false });

      if (currentGateId) {
        query = query.eq("gate_id", currentGateId);
      }

      const { data: visitorData, error: visitorError } = await query;

      if (!visitorError) {
        setVisitors(visitorData || []);
      }
      setLoading(false);

      const channel = supabase
        .channel("guard-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visitors" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newVisitor = payload.new as Visitor;
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
              
              setInfoModalVisitor((prev) => 
                prev?.id === payload.new.id ? (payload.new as Visitor) : prev
              );
            } else if (payload.eventType === "DELETE") {
              setVisitors((prev) => prev.filter((v) => v.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    const cleanup = initializeDashboard();
    return () => { cleanup.then(fn => fn && fn()); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleDirectApprove = async (visitor: Visitor) => {
    await supabase.from("visitors").update({ 
      status: "checked_in",
      checked_in_at: new Date().toISOString()
    }).eq("id", visitor.id);
  };

  const handleManualOverride = async (visitor: Visitor) => {
    if (!window.confirm("Bypass OTP security and manually check in this visitor?")) return;
    
    await supabase.from("visitors").update({ 
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
      custom_data: { ...(visitor.custom_data || {}), manual_override: "true" }
    }).eq("id", visitor.id);

    if (visitor.host_id && planTier !== "basic") {
      const { data: host } = await supabase.from('hosts').select('email, name').eq('id', visitor.host_id).single();
      if (host && host.email) {
        try {
          await fetch('/api/notify-host', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hostEmail: host.email,
              hostName: host.name,
              visitorName: visitor.name,
              visitorPhone: visitor.phone || 'Not provided',
              companyName: companyName,
              purpose: visitor.purpose || 'Not stated',
              visitorPhoto: visitor.photo_url || null,
              companyId: companyId
            })
          });
        } catch (notifyError) {
          console.error("Failed to trigger host notification:", notifyError);
        }
      }
    }
  };

  const handleSendOTP = async (id: string, phone: string) => {
    if (sendingOtpId === id) return; 
    setSendingOtpId(id); 

    try {
      let code = "";
      let isUnique = false;
      while (!isUnique) {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        code = (1000 + (randomValues[0] % 9000)).toString();
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
      otp_code: null 
    }).eq("id", id);
  };

  const handlePrintQr = () => {
    printGateQrPoster(window.location.origin, companyId, guardGateId, guardGateName);
  };
  const filteredVisitors = filterGuardVisitors(visitors, searchTerm, statusFilter);
  
  const totalToday = visitors.length;
  const checkedInCount = visitors.filter(v => v.status === "checked_in").length;
  const pendingCount = visitors.filter(v => v.status === "pending").length;

  const getDynamicQrUrl = () => {
    return getDynamicGateQrUrl(window.location.origin, companyId, guardGateId, qrTimestamp);
  };
  if (!companyId && !loading) {
    return <GuardProfileErrorState />;
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
          onShowQr={() => {
            setQrTimestamp(Date.now());
            setShowQrModal(true);
          }}
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
          planTier={planTier}
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
          onDirectApprove={handleDirectApprove}
          onManualOverride={handleManualOverride}
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

      <GuardQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        qrUrl={getDynamicQrUrl()}
        guardGateName={guardGateName}
        handlePrintQr={handlePrintQr}
      />
      <VisitInfoModal
        visitor={infoModalVisitor}
        onClose={() => setInfoModalVisitor(null)}
        customFieldLabels={customFieldLabels}
      />
      <PhotoLightbox
        photoUrl={enlargedPhoto}
        onClose={() => setEnlargedPhoto(null)}
      />
    </div>
  );
}
