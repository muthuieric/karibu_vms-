"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type CustomField = {
  id: string;
  label: string;
  active: boolean;
};

export function useBuildingRules() {
  const [companyId, setCompanyId] = useState("");
  const [planTier, setPlanTier] = useState("basic");
  const [requirePhoto, setRequirePhoto] = useState(false);
  const [askHost, setAskHost] = useState(false);
  const [askPurpose, setAskPurpose] = useState(false);
  const [askVehicle, setAskVehicle] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [updatingRules, setUpdatingRules] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchRules = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", authData.user.id)
        .single();

      if (!profile?.company_id) return;

      setCompanyId(profile.company_id);

      const { data: company } = await supabase
        .from("companies")
        .select("require_photo, ask_host, ask_purpose, ask_vehicle, custom_fields, plan_tier")
        .eq("id", profile.company_id)
        .single();

      if (company) {
        setPlanTier(company.plan_tier || "basic");
        setRequirePhoto(company.require_photo || false);
        setAskHost(company.ask_host || false);
        setAskPurpose(company.ask_purpose || false);
        setAskVehicle(company.ask_vehicle || false);
        setCustomFields(company.custom_fields || []);
      }
    };

    fetchRules();
  }, []);

  const handleToggleRule = async (field: string, checked: boolean, setter: (value: boolean) => void) => {
    setter(checked);
    setUpdatingRules(true);
    setMessage(null);

    const { error } = await supabase.from("companies").update({ [field]: checked }).eq("id", companyId);

    if (error) {
      setMessage({ type: "error", text: "Failed to update the rule." });
      setter(!checked);
    } else {
      setMessage({ type: "success", text: "Rules auto-saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    }
    setUpdatingRules(false);
  };

  const saveCustomFields = async (updatedFields: CustomField[]) => {
    setUpdatingRules(true);
    setMessage(null);
    const { error } = await supabase.from("companies").update({ custom_fields: updatedFields }).eq("id", companyId);

    if (error) {
      setMessage({ type: "error", text: "Failed to save custom fields." });
    } else {
      setMessage({ type: "success", text: "Custom fields updated!" });
      setTimeout(() => setMessage(null), 3000);
    }
    setUpdatingRules(false);
  };

  const handleAddCustomField = async () => {
    if (!newFieldName.trim()) return;

    const newField: CustomField = {
      id: Date.now().toString(),
      label: newFieldName.trim(),
      active: true,
    };
    const updatedFields = [...customFields, newField];
    setCustomFields(updatedFields);
    setNewFieldName("");
    await saveCustomFields(updatedFields);
  };

  const handleToggleCustomField = async (id: string, active: boolean) => {
    const updatedFields = customFields.map((field) => (field.id === id ? { ...field, active } : field));
    setCustomFields(updatedFields);
    await saveCustomFields(updatedFields);
  };

  const handleDeleteCustomField = async (id: string) => {
    const updatedFields = customFields.filter((field) => field.id !== id);
    setCustomFields(updatedFields);
    await saveCustomFields(updatedFields);
  };

  return {
    planTier,
    requirePhoto,
    askHost,
    askPurpose,
    askVehicle,
    customFields,
    newFieldName,
    updatingRules,
    message,
    setRequirePhoto,
    setAskHost,
    setAskPurpose,
    setAskVehicle,
    setNewFieldName,
    handleToggleRule,
    handleAddCustomField,
    handleToggleCustomField,
    handleDeleteCustomField,
  };
}
