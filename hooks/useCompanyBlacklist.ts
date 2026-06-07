"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from "@/lib/client-auth";

export type RedFlag = {
  id: string;
  name: string;
  id_number: string;
  id_number_last4?: string | null;
  phone: string;
  phone_last4?: string | null;
  vehicle_reg?: string;
  vehicle_reg_last4?: string | null;
  reason: string;
  reason_category?: string | null;
  status?: string | null;
  review_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
};

export type RedFlagForm = {
  name: string;
  id_number: string;
  phone: string;
  vehicle_reg: string;
  reason: string;
  reason_category?: string;
  review_months?: string;
  expires_months?: string;
};

export function useCompanyBlacklist() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingRedFlag, setIsSubmittingRedFlag] = useState(false);
  const [identifierWarning, setIdentifierWarning] = useState(false);
  const [newRedFlag, setNewRedFlag] = useState<RedFlagForm>({
    name: "",
    id_number: "",
    phone: "",
    vehicle_reg: "",
    reason: "",
    reason_category: "security_incident",
    review_months: "6",
    expires_months: "24",
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: authData } = await supabase.auth.getUser();

    if (authData?.user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (profileData?.company_id) {
        setCompanyId(profileData.company_id);

        try {
          const { data: companyRules } = await supabase
            .from("companies")
            .select("ask_phone, ask_id, ask_vehicle")
            .eq("id", profileData.company_id)
            .single();

          setIdentifierWarning(
            companyRules?.ask_phone === false &&
              companyRules?.ask_id === false &&
              companyRules?.ask_vehicle !== true
          );

          const res = await fetch(`/api/red-flags?company_id=${profileData.company_id}`, { headers: await getAuthHeaders() });
          if (res.ok) {
            const json = await res.json();
            if (json.data) setRedFlags(json.data);
          }
        } catch (err) {
          console.error("Error fetching red flags:", err);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const createRedFlag = async (formValues: RedFlagForm) => {
    if (!companyId) throw new Error("Company context is required.");

    const finalPhone = formValues.phone && !formValues.phone.startsWith("+") ? `+${formValues.phone}` : formValues.phone;
    const response = await fetch("/api/red-flags", {
      method: "POST",
      headers: await getAuthHeaders(true),
      body: JSON.stringify({ company_id: companyId, ...formValues, phone: finalPhone, action: "deny_entry" }),
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.error);
    return result.data as RedFlag;
  };

  const handleCreateRedFlag = async (e: React.FormEvent, onSuccess?: (redFlag?: RedFlag) => void) => {
    e.preventDefault();
    if (!companyId) return;

    setIsSubmittingRedFlag(true);
    try {
      const redFlag = await createRedFlag(newRedFlag);

      setNewRedFlag({
        name: "",
        id_number: "",
        phone: "",
        vehicle_reg: "",
        reason: "",
        reason_category: "security_incident",
        review_months: "6",
        expires_months: "24",
      });
      onSuccess?.(redFlag);
      fetchData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add red flag. Make sure the API route exists.";
      alert(message);
    } finally {
      setIsSubmittingRedFlag(false);
    }
  };

  const handleDeleteRedFlag = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the red flag for ${name}? They will be allowed to enter the building again.`)) return;

    try {
      const response = await fetch(`/api/red-flags?id=${id}`, { method: "DELETE", headers: await getAuthHeaders() });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setRedFlags((prev) => prev.filter((redFlag) => redFlag.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove red flag.";
      alert(message);
    }
  };

  return {
    companyId,
    redFlags,
    loading,
    isSubmittingRedFlag,
    newRedFlag,
    identifierWarning,
    setNewRedFlag,
    createRedFlag,
    fetchData,
    handleCreateRedFlag,
    handleDeleteRedFlag,
  };
}
