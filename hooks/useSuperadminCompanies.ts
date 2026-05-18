"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
};

export type PlanType = "none" | "trial_1" | "trial_2";

export function useSuperadminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [planType, setPlanType] = useState<PlanType>("trial_1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [adminForm, setAdminForm] = useState({ fullName: "", email: "", password: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [visitorStats, setVisitorStats] = useState({ total: 0, inside: 0, departed: 0, pending: 0 });
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [viewingCompanyName, setViewingCompanyName] = useState("");

  const fetchCompanies = async () => {
    setLoading(true);
    const { data } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
    setCompanies(
      ((data || []) as Company[]).map((company) => ({
        ...company,
        subscription_status: company.subscription_status || "trial",
        is_locked: company.is_locked || false,
        hard_locked: company.hard_locked || false,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    setIsSubmitting(true);

    let status = "unpaid";
    let endsAt = null;
    let startLocked = true;

    if (planType === "trial_1" || planType === "trial_2") {
      status = "trial";
      startLocked = false;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + (planType === "trial_1" ? 1 : 2));
      endsAt = expiryDate.toISOString();
    }

    const { error } = await supabase.from("companies").insert([
      {
        name: newCompanyName,
        subscription_status: status,
        subscription_ends_at: endsAt,
        is_locked: startLocked,
        amount_paid: 0,
      },
    ]);

    if (error) {
      alert(`Failed to create company: ${error.message}`);
    } else {
      setNewCompanyName("");
      setPlanType("trial_1");
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, planTier: newTier }),
      });
      const result = await res.json();
      if (res.ok) {
        setCompanies((prev) => prev.map((company) => (company.id === companyId ? { ...company, plan_tier: result.newTier } : company)));
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

  const filteredCompanies = useMemo(
    () =>
      companies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (company.contact_email && company.contact_email.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [companies, searchTerm]
  );

  return {
    companies,
    filteredCompanies,
    loading,
    searchTerm,
    newCompanyName,
    planType,
    isSubmitting,
    adminForm,
    isCreatingAdmin,
    visitorStats,
    loadingVisitors,
    viewingCompanyName,
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
