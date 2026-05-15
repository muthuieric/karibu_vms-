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

  // Geofence states
  const [enableGeofence, setEnableGeofence] = useState(false);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [radius, setRadius] = useState<string>("200");

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
        .select("require_photo, ask_host, ask_purpose, ask_vehicle, custom_fields, plan_tier, enable_geofence, lat, lng, geofence_radius")
        .eq("id", profile.company_id)
        .single();

      if (company) {
        setPlanTier(company.plan_tier || "basic");
        setRequirePhoto(company.require_photo || false);
        setAskHost(company.ask_host || false);
        setAskPurpose(company.ask_purpose || false);
        setAskVehicle(company.ask_vehicle || false);
        setCustomFields(company.custom_fields || []);
        
        setEnableGeofence(company.enable_geofence || false);
        setLatitude(company.lat ? company.lat.toString() : "");
        setLongitude(company.lng ? company.lng.toString() : "");
        setRadius(company.geofence_radius ? company.geofence_radius.toString() : "200");
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

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Geolocation is not supported by your browser." });
      return;
    }

    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setMessage({ type: "success", text: "Location coordinates updated! Remember to save." });
      },
      (error) => {
        console.error("Error getting location:", error);
        setMessage({ type: "error", text: "Failed to get location. Please allow location access in your browser." });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSaveGeofence = async () => {
    if (!companyId) return;
    setMessage(null);
    setUpdatingRules(true);

    const { error } = await supabase
      .from("companies")
      .update({
        enable_geofence: enableGeofence,
        lat: latitude ? parseFloat(latitude) : null,
        lng: longitude ? parseFloat(longitude) : null,
        geofence_radius: radius ? parseInt(radius) : 200
      })
      .eq("id", companyId);

    if (error) {
      setMessage({ type: "error", text: "Failed to save location settings." });
    } else {
      setMessage({ type: "success", text: "Location settings saved successfully." });
    }
    setUpdatingRules(false);
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
    
    // Geofence exports
    enableGeofence, setEnableGeofence,
    latitude, setLatitude,
    longitude, setLongitude,
    radius, setRadius,
    handleFetchLocation,
    handleSaveGeofence
  };
}
