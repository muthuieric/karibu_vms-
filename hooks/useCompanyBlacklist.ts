"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAuthHeaders } from "@/lib/client-auth";

export type RedFlag = {
  id: string;
  name: string;
  id_number: string;
  phone: string;
  vehicle_reg?: string;
  reason: string;
};

export function useCompanyBlacklist() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingRedFlag, setIsSubmittingRedFlag] = useState(false);
  const [identifierWarning, setIdentifierWarning] = useState(false);
  const [newRedFlag, setNewRedFlag] = useState({ name: "", id_number: "", phone: "", vehicle_reg: "", reason: "" });

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

  const handleCreateRedFlag = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!companyId) return;

    setIsSubmittingRedFlag(true);
    try {
      const finalPhone = newRedFlag.phone && !newRedFlag.phone.startsWith("+") ? `+${newRedFlag.phone}` : newRedFlag.phone;
      const response = await fetch("/api/red-flags", {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ company_id: companyId, ...newRedFlag, phone: finalPhone }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setNewRedFlag({ name: "", id_number: "", phone: "", vehicle_reg: "", reason: "" });
      onSuccess?.();
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
    handleCreateRedFlag,
    handleDeleteRedFlag,
  };
}
