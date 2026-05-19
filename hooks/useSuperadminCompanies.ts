"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateMonthlyCharge } from "@/lib/billing/pricing";
import { getAuthHeaders } from "@/lib/client-auth";

export type Company = {
  id: string;
  name: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  subscription_status: string;
  is_locked: boolean;
  hard_locked?: boolean;
  hard_lock_reason?: string | null;
  hard_locked_at?: string | null;
  plan_tier?: string;
  current_balance?: number | null;
};

export type PlanType = "basic" | "premium" | "custom" | "trial_basic" | "trial_premium";
export type FilterStatus = "all" | "paid" | "unpaid" | "trial" | "locked";

export function useSuperadminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [planType, setPlanType] = useState<PlanType>("trial_basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [adminForm, setAdminForm] = useState({ fullName: "", email: "", password: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [visitorStats, setVisitorStats] = useState({ total: 0, inside: 0, departed: 0, pending: 0 });
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [viewingCompanyName, setViewingCompanyName] = useState("");
  const [totalGuards, setTotalGuards] = useState(0);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const [companiesRes, guardsRes] = await Promise.all([
        supabase.from("companies").select("*").order("created_at", { ascending: false }),
        fetch("/api/superadmin/guards-count", { headers: await getAuthHeaders() }),
      ]);

      const guardsPayload = guardsRes.ok ? await guardsRes.json() : { count: 0 };

      if (!guardsRes.ok) console.error("Error fetching guards:", guardsPayload);

      setCompanies(
        ((companiesRes.data || []) as Company[]).map((company) => ({
          ...company,
          subscription_status: company.subscription_status || "trial",
          is_locked: company.is_locked || false,
          hard_locked: company.hard_locked || false,
          current_balance: company.current_balance || 0,
        }))
      );
      
      setTotalGuards(Number(guardsPayload.count) || 0);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    setIsSubmitting(true);

    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + 1);
    const isTrial = planType === "trial_basic" || planType === "trial_premium";
    const isCustom = planType === "custom";
    const status = isTrial ? "trial" : isCustom ? "active" : "unpaid";
    const startLocked = false;
    const currentBalance = isTrial || isCustom ? 0 : calculateMonthlyCharge(planType, 0).totalAmount;

    const { error } = await supabase
      .from("companies")
      .insert([
        {
          name: newCompanyName,
          subscription_status: status,
          subscription_ends_at: isTrial ? endsAt.toISOString() : null,
          subscription_expires_at: isTrial ? endsAt.toISOString() : null,
          plan_tier: planType,
          is_locked: startLocked,
          hard_locked: false,
          current_balance: currentBalance,
          amount_paid: 0,
          billing_period_start: startsAt.toISOString(),
          billing_period_end: endsAt.toISOString(),
        },
      ])
      .select("id")
      .single();

    if (error) {
      alert(`Failed to create company: ${error.message}`);
    } else {
      setNewCompanyName("");
      setPlanType("trial_basic");
      onSuccess?.();
      fetchCompanies();
    }
    setIsSubmitting(false);
  };

  const openAdminForm = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setAdminForm({ fullName: "", email: "", password: "" });
  };

  const handleCreateAdmin = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    setIsCreatingAdmin(true);

    try {
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ ...adminForm, companyId: selectedCompanyId }),
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.error) {
          alert(`Error: ${result.error}`);
        } else {
          alert("Admin account created successfully! They can now log in.");
          onSuccess?.();
        }
      } else {
        alert(`Server Error (${response.status})`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown network error";
      alert(`Network/Connection failed: ${message}`);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const viewCompanyVisitors = async (companyId: string, companyName: string) => {
    setViewingCompanyName(companyName);
    setLoadingVisitors(true);

    const { data, error } = await supabase.from("visitors").select("status").eq("company_id", companyId);

    if (error) {
      setVisitorStats({ total: 0, inside: 0, departed: 0, pending: 0 });
    } else {
      setVisitorStats({
        total: data.length,
        inside: data.filter((visitor) => visitor.status === "checked_in").length,
        departed: data.filter((visitor) => visitor.status === "checked_out").length,
        pending: data.filter((visitor) => visitor.status === "pending").length,
      });
    }
    setLoadingVisitors(false);
  };

  const toggleCompanyLock = async (companyId: string, currentLockStatus: boolean, skipConfirm = false) => {
    const action = currentLockStatus ? "Remove Soft Lock" : "Soft Lock";
    if (!skipConfirm && !window.confirm(`Are you sure you want to ${action.toLowerCase()} this company's account?`)) return;

    const { error } = await supabase.from("companies").update({ is_locked: !currentLockStatus }).eq("id", companyId);
    if (error) {
      alert(`Failed to update lock status: ${error.message}`);
    } else {
      fetchCompanies();
    }
  };

  const toggleCompanyHardLock = async (companyId: string, currentHardLockStatus: boolean) => {
    const confirmed = currentHardLockStatus
      ? window.confirm("Remove hard lock and restore access?")
      : window.confirm("Hard lock this workspace? Company admins and guards will not be able to access the system until unlocked.");

    if (!confirmed) return;

    const updatePayload = currentHardLockStatus
      ? {
          hard_locked: false,
          hard_locked_at: null,
          hard_lock_reason: null,
        }
      : {
          hard_locked: true,
          hard_locked_at: new Date().toISOString(),
          hard_lock_reason: "Payment required",
        };

    const { error } = await supabase.from("companies").update(updatePayload).eq("id", companyId);
    if (error) {
      alert(`Failed to update hard lock status: ${error.message}`);
    } else {
      fetchCompanies();
    }
  };

  const approveCompany = async (companyId: string) => {
    if (!window.confirm("Are you sure you want to approve this company and start their 1-month free trial?")) return;

    try {
      const response = await fetch("/api/companies/approve", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ companyId }),
      });
      const data = await response.json();

      if (data.error) {
        alert(`Failed to approve company: ${data.error}`);
      } else {
        alert("Company approved and notification email sent!");
        fetchCompanies();
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to approval service.");
    }
  };

  const handleChangePlanTier = async (companyId: string, newTier: string) => {
    try {
      const res = await fetch("/api/companies/update-plan", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ companyId, planTier: newTier }),
      });
      const result = await res.json();
      if (res.ok) {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  plan_tier: result.newTier,
                  subscription_status: result.subscriptionStatus || company.subscription_status,
                  current_balance: result.currentBalance ?? company.current_balance,
                  is_locked: result.isLocked ?? company.is_locked,
                  hard_locked: result.hardLocked ?? company.hard_locked,
                }
              : company
          )
        );
        alert(
          result.pendingTier
            ? `${result.pendingTier.toUpperCase()} will start on the next billing cycle. Current invoices stay on ${result.newTier.toUpperCase()}.`
            : `Success! The company plan has been updated to ${result.newTier.toUpperCase()}.`
        );
      } else {
        alert(result.error || "Failed to update plan");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update plan due to a network error.");
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (company.contact_email && company.contact_email.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      const balance = company.current_balance || 0;
      const isHardLocked = company.hard_locked === true;
      const isSoftLocked = company.is_locked === true;
      const isTrial = company.subscription_status === "trial";

      switch (statusFilter) {
        case "paid":
          return balance <= 0 && !isHardLocked && !isSoftLocked;
        case "unpaid":
          return balance > 0 && !isHardLocked;
        case "trial":
          return isTrial && !isHardLocked;
        case "locked":
          return isHardLocked || isSoftLocked;
        case "all":
        default:
          return true;
      }
    });
  }, [companies, searchTerm, statusFilter]);

  // Derived KPIs for PlatformKpiGrid
  const accountsGoodStanding = companies.filter(c => !c.hard_locked && !c.is_locked && ((c.current_balance || 0) <= 0 || c.subscription_status === "trial")).length;
  const accountsOwing = companies.filter(c => !c.hard_locked && !c.is_locked && (c.current_balance || 0) > 0).length;

  return {
    companies,
    filteredCompanies,
    loading,
    searchTerm,
    statusFilter,
    newCompanyName,
    planType,
    isSubmitting,
    adminForm,
    isCreatingAdmin,
    visitorStats,
    loadingVisitors,
    viewingCompanyName,
    totalGuards,
    accountsGoodStanding,
    accountsOwing,
    setStatusFilter,
    setSearchTerm,
    setNewCompanyName,
    setPlanType,
    setAdminForm,
    handleCreateCompany,
    openAdminForm,
    handleCreateAdmin,
    viewCompanyVisitors,
    toggleCompanyLock,
    toggleCompanyHardLock,
    approveCompany,
    handleChangePlanTier,
  };
}
