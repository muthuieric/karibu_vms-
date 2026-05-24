"use client";

import { useEffect, useState } from "react";
import { getBasePlan } from "@/lib/billing/pricing";
import { getAuthHeaders } from "@/lib/client-auth";
import { getDistanceInMeters } from "@/lib/geo";
import { supabase } from "@/lib/supabase";
import {
  canChooseVerificationMethod,
  getVerificationPlanState,
  isQrPassFrontendEnabled,
  resolveVisitorVerificationMethod,
  type VisitorVerificationMethod,
} from "@/lib/visitor-verification";

export type CustomField = {
  id: string;
  label: string;
  active: boolean;
};

export type GeofenceDistanceTest = {
  currentLat: number;
  currentLng: number;
  savedLat: number;
  savedLng: number;
  distanceMeters: number;
  accuracyMeters: number;
};

export function useBuildingRules() {
  const [companyId, setCompanyId] = useState("");
  const [planTier, setPlanTier] = useState("basic");
  const [verificationPlanState, setVerificationPlanState] = useState<"eligible" | "locked" | "unknown">("unknown");
  const [canChooseVerification, setCanChooseVerification] = useState(false);
  const [visitorVerificationMethod, setVisitorVerificationMethod] = useState<VisitorVerificationMethod>("qr_pass");
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
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isLikelyDesktop] = useState(() => {
    if (typeof navigator === "undefined") return false;
    return !/android|iphone|ipad|ipod|mobile/.test(navigator.userAgent.toLowerCase());
  });
  const [testingDistance, setTestingDistance] = useState(false);
  const [distanceTest, setDistanceTest] = useState<GeofenceDistanceTest | null>(null);

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
        .select("require_photo, ask_host, ask_purpose, ask_vehicle, custom_fields, plan_tier, visitor_verification_method, enable_geofence, lat, lng, geofence_radius")
        .eq("id", profile.company_id)
        .single();

      if (company) {
        const basePlan = getBasePlan(company.plan_tier);
        const planState = getVerificationPlanState(company.plan_tier);
        const eligibleForVerificationChoice = canChooseVerificationMethod(company.plan_tier);
        const resolvedVerificationMethod = resolveVisitorVerificationMethod(company.plan_tier, company.visitor_verification_method);
        setPlanTier(basePlan);
        setVerificationPlanState(planState);
        setCanChooseVerification(eligibleForVerificationChoice);
        setVisitorVerificationMethod(resolvedVerificationMethod === "basic_default" ? "qr_pass" : resolvedVerificationMethod);
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

  const handleVerificationMethodChange = async (method: VisitorVerificationMethod) => {
    if (!companyId || !canChooseVerification || visitorVerificationMethod === method) return;

    const previousMethod = visitorVerificationMethod;
    setVisitorVerificationMethod(method);
    setUpdatingRules(true);
    setMessage(null);

    try {
      const response = await fetch("/api/company-rules/verification-method", {
        method: "PATCH",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ companyId, verificationMethod: method }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Failed to update verification method.");
      }

      setMessage({ type: "success", text: "Verification method updated." });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setVisitorVerificationMethod(previousMethod);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update verification method.",
      });
    } finally {
      setUpdatingRules(false);
    }
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
        setLocationAccuracy(position.coords.accuracy);
        setDistanceTest(null);
        setMessage({ type: "success", text: "Location coordinates updated from this device. Review them below, then save." });
      },
      (error) => {
        console.error("Error getting location:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setMessage({ type: "error", text: "Please allow location access to continue." });
        } else {
          setMessage({ type: "error", text: "Failed to get location. Move near the entrance, enable precise location, then try again." });
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleTestDistance = () => {
    const savedLat = latitude ? parseFloat(latitude) : null;
    const savedLng = longitude ? parseFloat(longitude) : null;

    if (
      savedLat === null ||
      savedLng === null ||
      Number.isNaN(savedLat) ||
      Number.isNaN(savedLng)
    ) {
      setMessage({ type: "error", text: "Add saved latitude and longitude before testing your current distance." });
      return;
    }

    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Geolocation is not supported by your browser." });
      return;
    }

    setMessage(null);
    setTestingDistance(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        const accuracyMeters = position.coords.accuracy;
        const distanceMeters = getDistanceInMeters(currentLat, currentLng, savedLat, savedLng);

        setDistanceTest({
          currentLat,
          currentLng,
          savedLat,
          savedLng,
          distanceMeters,
          accuracyMeters,
        });
        setTestingDistance(false);
      },
      (error) => {
        console.error("Error testing current distance:", error);
        if (error.code === error.PERMISSION_DENIED) {
          setMessage({ type: "error", text: "Please allow location access to test your current distance." });
        } else {
          setMessage({ type: "error", text: "Failed to test current distance. Enable precise location, then try again." });
        }
        setTestingDistance(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSaveGeofence = async () => {
    if (!companyId) return;
    setMessage(null);
    setUpdatingRules(true);
    const parsedLatitude = latitude ? parseFloat(latitude) : null;
    const parsedLongitude = longitude ? parseFloat(longitude) : null;
    const parsedRadius = radius ? parseInt(radius, 10) : 200;

    if (
      enableGeofence &&
      (
        parsedLatitude === null ||
        parsedLongitude === null ||
        Number.isNaN(parsedLatitude) ||
        Number.isNaN(parsedLongitude)
      )
    ) {
      setMessage({ type: "error", text: "Add valid latitude and longitude before enabling location verification." });
      setUpdatingRules(false);
      return;
    }

    const { error } = await supabase
      .from("companies")
      .update({
        enable_geofence: enableGeofence,
        lat: parsedLatitude,
        lng: parsedLongitude,
        geofence_radius: Number.isNaN(parsedRadius) ? 200 : parsedRadius
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
    verificationPlanState,
    canChooseVerification,
    isQrPassFrontendEnabled: isQrPassFrontendEnabled(),
    visitorVerificationMethod,
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
    handleVerificationMethodChange,
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
    locationAccuracy,
    isLikelyDesktop,
    testingDistance,
    distanceTest,
    handleFetchLocation,
    handleTestDistance,
    handleSaveGeofence
  };
}
