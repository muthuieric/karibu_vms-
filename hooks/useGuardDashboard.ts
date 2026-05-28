"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from "@/lib/client-auth";
import { filterGuardVisitors, getDynamicGateQrUrl, printGateQrPoster } from "@/lib/guard-dashboard";
import { getBasePlan } from "@/lib/billing/pricing";
import { isQrPassFrontendEnabled, resolveVisitorVerificationMethod, type VisitorVerificationMethod } from "@/lib/visitor-verification";
import type { CustomField, Visitor } from "@/types/guard";

function addVisitorOnce(visitors: Visitor[], visitor: Visitor) {
  if (visitors.some((existing) => existing.id === visitor.id)) return visitors;
  return [visitor, ...visitors];
}

async function fetchGuardVisitors(companyId: string, visitorId?: string) {
  const params = new URLSearchParams({ company_id: companyId });
  if (visitorId) params.set("id", visitorId);

  const response = await fetch(`/api/guard/visitors?${params.toString()}`, {
    headers: await getAuthHeaders(),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Active visitors could not be loaded.");
  return (result.data || []) as Visitor[];
}

export function useGuardDashboard() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState("basic");
  const [verificationMethod, setVerificationMethod] = useState<VisitorVerificationMethod | "basic_default">("basic_default");
  const [qrPassSetupWarning, setQrPassSetupWarning] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<"session_expired" | "profile_missing" | null>(null);
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
  const [requirePhone, setRequirePhone] = useState(false);
  const [requireId, setRequireId] = useState(false);
  const [requireHost, setRequireHost] = useState(false);
  const [requirePurpose, setRequirePurpose] = useState(false);
  const [requireVehicle, setRequireVehicle] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sendingOtpId, setSendingOtpId] = useState<string | null>(null);
  const [approvingPassId, setApprovingPassId] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [qrTimestamp, setQrTimestamp] = useState(0);

  const tickQrTimestamp = () => setQrTimestamp(Date.now());

  const applyCompanySettings = useCallback((companyData: {
    require_photo?: boolean | null;
    ask_phone?: boolean | null;
    ask_id?: boolean | null;
    ask_host?: boolean | null;
    ask_purpose?: boolean | null;
    ask_vehicle?: boolean | null;
    require_phone?: boolean | null;
    require_id?: boolean | null;
    require_host?: boolean | null;
    require_purpose?: boolean | null;
    require_vehicle?: boolean | null;
    custom_fields?: unknown;
    is_locked?: boolean | null;
    subscription_ends_at?: string | null;
    plan_tier?: string | null;
    visitor_verification_method?: string | null;
    qr_pass_backend_enabled?: boolean | null;
  }) => {
    const resolvedVerificationMethod = resolveVisitorVerificationMethod(
      companyData.plan_tier,
      companyData.visitor_verification_method
    );

    setPlanTier(getBasePlan(companyData.plan_tier));
    setVerificationMethod(resolvedVerificationMethod);
    setQrPassSetupWarning(
      resolvedVerificationMethod === "qr_pass" && (!isQrPassFrontendEnabled() || companyData.qr_pass_backend_enabled === false)
        ? "QR Pass is selected but not enabled in environment settings."
        : null
    );
    setRequirePhoto(companyData.require_photo || false);
    setAskPhone(companyData.ask_phone !== false);
    setAskId(companyData.ask_id !== false);
    setAskHost(companyData.ask_host || false);
    setAskPurpose(companyData.ask_purpose || false);
    setAskVehicle(companyData.ask_vehicle || false);
    setRequirePhone(companyData.require_phone || false);
    setRequireId(companyData.require_id || false);
    setRequireHost(companyData.require_host || false);
    setRequirePurpose(companyData.require_purpose || false);
    setRequireVehicle(companyData.require_vehicle || false);
    setIsLocked(companyData.is_locked || (companyData.subscription_ends_at ? new Date(companyData.subscription_ends_at) < new Date() : false));

    if (companyData.custom_fields) {
      const labelMap: Record<string, string> = {};
      const fields = Array.isArray(companyData.custom_fields) ? (companyData.custom_fields as CustomField[]) : [];
      fields.forEach((field) => {
        labelMap[field.id] = field.label;
      });
      setCustomFieldLabels(labelMap);
    }
  }, []);

  const refreshCompanySettings = useCallback(async (targetCompanyId: string | null) => {
    if (!targetCompanyId) return;

    const { data: companyData, error } = await supabase
      .from("companies")
      .select("name, require_photo, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle, require_phone, require_id, require_host, require_purpose, require_vehicle, custom_fields, is_locked, subscription_ends_at, plan_tier, visitor_verification_method")
      .eq("id", targetCompanyId)
      .single();

    if (error) {
      console.error("Could not refresh company visitor rules:", error);
      return;
    }

    if (companyData) {
      const resolvedVerificationMethod = resolveVisitorVerificationMethod(
        companyData.plan_tier,
        companyData.visitor_verification_method
      );
      let qrPassBackendEnabled: boolean | null = null;

      if (resolvedVerificationMethod === "qr_pass") {
        try {
          const response = await fetch(`/api/company-rules/verification-method?companyId=${targetCompanyId}`, {
            headers: await getAuthHeaders(),
          });
          const result = await response.json().catch(() => ({}));
          if (response.ok && typeof result.data?.qrPassBackendEnabled === "boolean") {
            qrPassBackendEnabled = result.data.qrPassBackendEnabled;
          }
        } catch (error) {
          console.error("Could not verify QR Pass backend flag:", error);
        }
      }

      applyCompanySettings({ ...companyData, qr_pass_backend_enabled: qrPassBackendEnabled });
    }
  }, [applyCompanySettings]);

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
        setAccessError("session_expired");
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
        setAccessError("profile_missing");
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

      await refreshCompanySettings(currentCompanyId);

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      try {
        const rolloverAt = new Date().toISOString();
        await supabase
          .from("visitors")
          .update({
            status: "checked_out",
            checked_out_at: rolloverAt,
            pass_expired_at: rolloverAt,
            otp_code: null,
          })
          .eq("company_id", currentCompanyId)
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Visitor status rollover failed:", err);
      }

      try {
        setVisitors(await fetchGuardVisitors(currentCompanyId));
      } catch (visitorError) {
        console.error("Could not load active guard visitors:", visitorError);
      }
      setLoading(false);

      const channel = supabase
        .channel("guard-dashboard")
        .on("postgres_changes", { event: "*", schema: "public", table: "visitors" }, (payload) => {
          void refreshCompanySettings(currentCompanyId);

          if (payload.eventType === "INSERT") {
            const newVisitor = payload.new as Visitor;
            if (newVisitor.company_id !== currentCompanyId) return;
            if (!currentGateId || newVisitor.gate_id === currentGateId || !newVisitor.gate_id) {
              fetchGuardVisitors(currentCompanyId, newVisitor.id)
                .then((records) => {
                  const visitor = records[0];
                  if (visitor) setVisitors((prev) => addVisitorOnce(prev, visitor));
                })
                .catch((error) => console.error("Could not hydrate inserted guard visitor:", error));
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
              fetchGuardVisitors(currentCompanyId, updatedVisitor.id)
                .then((records) => {
                  const visitor = records[0];
                  setVisitors((prev) => {
                    if (!visitor) return prev.filter((item) => item.id !== updatedVisitor.id);
                    return prev.map((item) => (item.id === visitor.id ? visitor : item));
                  });
                })
                .catch((error) => console.error("Could not hydrate updated guard visitor:", error));
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
  }, [applyCompanySettings, refreshCompanySettings]);

  useEffect(() => {
    const handleFocus = () => {
      void refreshCompanySettings(companyId);
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [companyId, refreshCompanySettings]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleDirectApprove = async (visitor: Visitor) => {
    await supabase
      .from("visitors")
      .update({ status: "checked_in", checked_in_at: new Date().toISOString() })
      .eq("id", visitor.id);
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
      try {
        await fetch("/api/notify-host", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: visitor.id,
            companyId,
          }),
        });
      } catch (notifyError) {
        console.error("Failed to trigger host notification:", notifyError);
      }
    }
  };

  const handleSendOTP = async (id: string) => {
    if (sendingOtpId === id) return;
    setSendingOtpId(id);

    try {
      if (!companyId) throw new Error("Company context is missing.");

      const smsRes = await fetch("/api/visitors/send-otp", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ visitorId: id }),
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

    await supabase
      .from("visitors")
      .update({ status: "checked_in", checked_in_at: new Date().toISOString(), verification_method: "sms_otp" })
      .eq("id", visitor.id);
    setVerifyingId(null);
  };

  const handleApprovePass = async (visitor: Visitor) => {
    if (approvingPassId === visitor.id) return;
    setApprovingPassId(visitor.id);

    try {
      const response = await fetch("/api/visitor-pass/approve", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ visitorId: visitor.id }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Visitor pass could not be approved.");
      }

      if (result.data) {
        const refreshedVisitors = await fetchGuardVisitors(visitor.company_id, visitor.id);
        const refreshedVisitor = refreshedVisitors[0] || (result.data as Visitor);
        setVisitors((prev) => prev.map((item) => (item.id === visitor.id ? refreshedVisitor : item)));
      }
    } catch (error) {
      console.error("Failed to approve visitor pass:", error);
      alert(error instanceof Error ? error.message : "Visitor pass could not be approved.");
    } finally {
      setApprovingPassId(null);
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const response = await fetch("/api/visitor-pass/checkout", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ visitorId: id }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Visitor could not be checked out.");
      }

      if (result.data) {
        setVisitors((prev) => prev.filter((visitor) => visitor.id !== id));
      }
    } catch (error) {
      console.error("Failed to check out visitor:", error);
      alert(error instanceof Error ? error.message : "Visitor could not be checked out.");
    }
  };

  return {
    companyId,
    accessError,
    visitors,
    loading,
    planTier,
    verificationMethod,
    qrPassSetupWarning,
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
    requirePhone,
    requireId,
    requireHost,
    requirePurpose,
    requireVehicle,
    isLocked,
    verifyingId,
    sendingOtpId,
    approvingPassId,
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
    refreshCompanySettings: () => refreshCompanySettings(companyId),
    handleLogout,
    handleDirectApprove,
    handleManualOverride,
    handleSendOTP,
    handleConfirmOTP,
    handleApprovePass,
    handleCheckOut,
    handlePrintQr: () => printGateQrPoster(window.location.origin, companyId, guardGateId, guardGateName),
    getDynamicQrUrl: () => getDynamicGateQrUrl(window.location.origin, companyId, guardGateId, qrTimestamp),
    addVisitorToQueue,
  };
}
