"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from "@/lib/client-auth";
import { filterGuardVisitors, getDynamicGateQrUrl, printGateQrPoster } from "@/lib/guard-dashboard";
import { getBasePlan } from "@/lib/billing/pricing";
import type { CustomField, Visitor } from "@/types/guard";

function addVisitorOnce(visitors: Visitor[], visitor: Visitor) {
  if (visitors.some((existing) => existing.id === visitor.id)) return visitors;
  return [visitor, ...visitors];
}

export function useGuardDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [planTier, setPlanTier] = useState("basic");
  const [guardGateId, setGuardGateId] = useState<string | null>(null);
  const [guardGateName, setGuardGateName] = useState("All Gates");
  const [customFieldLabels, setCustomFieldLabels] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "checked_in">("all");
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [askPhone, setAskPhone] = useState(true);
  const [askId, setAskId] = useState(true);
  const [askHost, setAskHost] = useState(false);
  const [askPurpose, setAskPurpose] = useState(false);
  const [askVehicle, setAskVehicle] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sendingOtpId, setSendingOtpId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [qrTimestamp, setQrTimestamp] = useState(0);

  const tickQrTimestamp = () => setQrTimestamp(Date.now());

  const addVisitorToQueue = (visitor: Visitor) => {
    if (!companyId || visitor.company_id !== companyId) return;
    if (guardGateId && visitor.gate_id && visitor.gate_id !== guardGateId) return;

    setVisitors((prev) => {
      return addVisitorOnce(prev, visitor);
    });
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        setLoading(false);
        return undefined;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("company_id, gate_id")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error("Could not load guard profile:", profileError);
        setLoading(false);
        return undefined;
      }

      const currentCompanyId = profileData.company_id;
      const currentGateId = profileData.gate_id;

      setCompanyId(currentCompanyId);
      setGuardGateId(currentGateId);

      if (currentGateId) {
        const { data: gateData } = await supabase.from("gates").select("name").eq("id", currentGateId).single();
        if (gateData) setGuardGateName(gateData.name);
      }

      const { data: companyData } = await supabase
        .from("companies")
        .select("name, require_photo, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle, custom_fields, is_locked, subscription_ends_at, plan_tier")
        .eq("id", currentCompanyId)
        .single();

      if (companyData) {
        setCompanyName(companyData.name || "");
        setPlanTier(getBasePlan(companyData.plan_tier));
        setRequirePhoto(companyData.require_photo || false);
        setAskPhone(companyData.ask_phone !== false);
        setAskId(companyData.ask_id !== false);
        setAskHost(companyData.ask_host || false);
        setAskPurpose(companyData.ask_purpose || false);
        setAskVehicle(companyData.ask_vehicle || false);
        setIsLocked(companyData.is_locked || (companyData.subscription_ends_at ? new Date(companyData.subscription_ends_at) < new Date() : false));

        if (companyData.custom_fields) {
          const labelMap: Record<string, string> = {};
          const fields = Array.isArray(companyData.custom_fields) ? (companyData.custom_fields as CustomField[]) : [];
          fields.forEach((field) => {
            labelMap[field.id] = field.label;
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
            status: "checked_out",
            checked_out_at: new Date().toISOString(),
            otp_code: null,
          })
          .eq("company_id", currentCompanyId)
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Visitor status rollover failed:", err);
      }

      let query = supabase
        .from("visitors")
        .select("*")
        .eq("company_id", currentCompanyId)
        .gte("created_at", startOfToday.toISOString())
        .in("status", ["pending", "checked_in"])
        .order("created_at", { ascending: false });

      if (currentGateId) {
        query = query.or(`gate_id.eq.${currentGateId},gate_id.is.null`);
      }

      const { data: visitorData, error: visitorError } = await query;
      if (!visitorError) setVisitors(visitorData || []);
      setLoading(false);

      const channel = supabase
        .channel("guard-dashboard")
        .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, (payload) => {
          if (payload.eventType === "INSERT") {
            const newVisitor = payload.new as Visitor;
            if (newVisitor.company_id !== currentCompanyId) return;
            if (!currentGateId || newVisitor.gate_id === currentGateId || !newVisitor.gate_id) {
              setVisitors((prev) => addVisitorOnce(prev, newVisitor));
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedVisitor = payload.new as Visitor;
            if (updatedVisitor.company_id !== currentCompanyId) return;
            if (currentGateId && updatedVisitor.gate_id && updatedVisitor.gate_id !== currentGateId) {
              setVisitors((prev) => prev.filter((visitor) => visitor.id !== updatedVisitor.id));
              return;
            }
            if (payload.new.status === "checked_out") {
              setVisitors((prev) => prev.filter((visitor) => visitor.id !== payload.new.id));
            } else {
              setVisitors((prev) =>
                prev.map((visitor) => (visitor.id === payload.new.id ? (payload.new as Visitor) : visitor))
              );
            }
          } else if (payload.eventType === "DELETE") {
            setVisitors((prev) => prev.filter((visitor) => visitor.id !== payload.old.id));
          }
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    };

    const cleanup = initializeDashboard();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleDirectApprove = async (visitor: Visitor) => {
    await supabase.from("visitors").update({ status: "checked_in", checked_in_at: new Date().toISOString() }).eq("id", visitor.id);
  };

  const handleManualOverride = async (visitor: Visitor) => {
    if (!window.confirm("Bypass OTP security and manually check in this visitor?")) return;

    await supabase
      .from("visitors")
      .update({
        status: "checked_in",
        checked_in_at: new Date().toISOString(),
        custom_data: { ...(visitor.custom_data || {}), manual_override: "true" },
      })
      .eq("id", visitor.id);

    if (visitor.host_id && planTier !== "basic") {
      const { data: host } = await supabase.from("hosts").select("email, name").eq("id", visitor.host_id).single();
      if (host?.email) {
        try {
          await fetch("/api/notify-host", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hostEmail: host.email,
              hostName: host.name,
              visitorName: visitor.name,
              visitorPhone: visitor.phone || "Not provided",
              companyName,
              purpose: visitor.purpose || "Not stated",
              visitorPhoto: visitor.photo_url || null,
              companyId,
            }),
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
      if (!companyId) throw new Error("Company context is missing.");

      let code = "";
      let isUnique = false;
      while (!isUnique) {
        const randomValues = new Uint32Array(1);
        crypto.getRandomValues(randomValues);
        code = (1000 + (randomValues[0] % 9000)).toString();
        const { data } = await supabase.from("visitors").select("id").eq("otp_code", code).in("status", ["pending", "checked_in"]);
        if (!data || data.length === 0) isUnique = true;
      }

      const { error: updateError } = await supabase.from("visitors").update({ otp_code: code }).eq("id", id);
      if (updateError) throw updateError;

      const smsRes = await fetch("/api/sms", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ phone, companyId, message: `Your building entry code is: ${code}` }),
      });

      const smsData = await smsRes.json().catch(() => ({}));
      if (!smsRes.ok) {
        await supabase.from("visitors").update({ otp_code: null }).eq("id", id);
        throw new Error(smsData.error || "OTP was not sent.");
      }

      setVerifyingId(id);
      setOtpInput("");
    } catch (err) {
      console.error(err);
      alert("OTP was not sent. Please check Africa’s Talking setup or SMS credits.");
    } finally {
      setSendingOtpId(null);
    }
  };

  const handleConfirmOTP = async (visitor: Visitor) => {
    const { data } = await supabase.from("visitors").select("otp_code").eq("id", visitor.id).single();
    if (!data || data.otp_code !== otpInput.trim()) return alert("Incorrect OTP.");

    await supabase.from("visitors").update({ status: "checked_in", checked_in_at: new Date().toISOString() }).eq("id", visitor.id);
    setVerifyingId(null);
  };

  const handleCheckOut = async (id: string) => {
    await supabase
      .from("visitors")
      .update({ status: "checked_out", checked_out_at: new Date().toISOString(), otp_code: null })
      .eq("id", id);
  };

  return {
    companyId,
    visitors,
    loading,
    planTier,
    guardGateId,
    guardGateName,
    customFieldLabels,
    searchTerm,
    statusFilter,
    requirePhoto,
    askPhone,
    askId,
    askHost,
    askPurpose,
    askVehicle,
    isLocked,
    verifyingId,
    sendingOtpId,
    otpInput,
    filteredVisitors: filterGuardVisitors(visitors, searchTerm, statusFilter),
    totalToday: visitors.length,
    checkedInCount: visitors.filter((visitor) => visitor.status === "checked_in").length,
    pendingCount: visitors.filter((visitor) => visitor.status === "pending").length,
    setSearchTerm,
    setStatusFilter,
    setOtpInput,
    setVerifyingId,
    tickQrTimestamp,
    handleLogout,
    handleDirectApprove,
    handleManualOverride,
    handleSendOTP,
    handleConfirmOTP,
    handleCheckOut,
    handlePrintQr: () => printGateQrPoster(window.location.origin, companyId, guardGateId, guardGateName),
    getDynamicQrUrl: () => getDynamicGateQrUrl(window.location.origin, companyId, guardGateId, qrTimestamp),
    addVisitorToQueue,
  };
}
