"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { compressImage } from "@/lib/image-compression";
import { getDistanceInMeters } from "@/lib/geo";
import { getSupabaseErrorMessage } from "@/lib/supabase-error";
import { getBasePlan } from "@/lib/billing/pricing";

type CustomField = { id: string; label: string; active: boolean };
type Department = { id: string; name: string };
type Host = { id: string; name: string; phone: string; email: string; department_id: string };
type RedFlag = { id_number?: string | null; phone?: string | null; name?: string | null; reason?: string | null };
export type GeofenceDebugDetails = {
  currentLat: number;
  currentLng: number;
  allowedLat: number;
  allowedLng: number;
  accuracyMeters: number;
  radiusMeters: number;
  distanceMeters: number;
  companyId: string;
  gateId: string | null;
  companyName: string;
};
type GeofenceFailureDetails = Pick<GeofenceDebugDetails, "distanceMeters" | "radiusMeters" | "accuracyMeters">;
type VisitorFormData = {
  name: string;
  phone: string;
  id_number: string;
  doc_type: string;
  host_id: string;
  purpose: string;
  vehicle_reg: string;
};
type ValidationErrors = Partial<Record<"name" | "phone" | "id_number" | "host_id" | "selfie" | "terms", string>>;

function validateDocumentNumber(docType: string, value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Document number is required.";
  }

  if (docType === "National ID" && !/^\d{7,8}$/.test(trimmedValue)) {
    return "National ID should be 7 to 8 digits.";
  }

  if (docType === "Passport" && !/^[A-Za-z0-9]{6,12}$/.test(trimmedValue)) {
    return "Passport should be 6 to 12 letters or numbers.";
  }

  if (docType === "Driver's License" && !/^[A-Za-z0-9/-]{5,20}$/.test(trimmedValue)) {
    return "Driver's License should be 5 to 20 letters, numbers, slash, or hyphen.";
  }

  return null;
}

function validatePublicRegistration({
  visitor,
  rules,
  hasSelfie,
  agreedToTerms,
}: {
  visitor: VisitorFormData;
  rules: {
    requirePhoto: boolean;
    askPhone: boolean;
    askId: boolean;
    askHost: boolean;
  };
  hasSelfie: boolean;
  agreedToTerms: boolean;
}) {
  const errors: ValidationErrors = {};
  const name = visitor.name.trim();
  const phoneDigits = visitor.phone.replace(/\D/g, "");

  if (name.length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

  if (rules.askPhone) {
    if (!phoneDigits) {
      errors.phone = "Phone number is required.";
    } else if (phoneDigits.length < 8 || phoneDigits.length > 15) {
      errors.phone = "Phone number should have 8 to 15 digits.";
    } else if (phoneDigits.startsWith("254") && !/^254[71]\d{8}$/.test(phoneDigits)) {
      errors.phone = "Kenyan numbers should use 2547XXXXXXXX or 2541XXXXXXXX.";
    }
  }

  if (rules.askId) {
    const documentError = validateDocumentNumber(visitor.doc_type, visitor.id_number);
    if (documentError) errors.id_number = documentError;
  }

  if (rules.askHost && !visitor.host_id) {
    errors.host_id = "Please select a host from the list.";
  }

  if (rules.requirePhoto && !hasSelfie) {
    errors.selfie = "Security photo is required.";
  }

  if (!agreedToTerms) {
    errors.terms = "Please agree to the terms before submitting.";
  }

  return errors;
}

export function usePublicGateCheckIn() {
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = params.companyId as string;
  const urlGateId = searchParams.get("gateId");

  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [planTier, setPlanTier] = useState("basic");
  const [accessDenied, setAccessDenied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isQrExpired, setIsQrExpired] = useState(false);
  const [geofenceError, setGeofenceError] = useState<string | null>(null);
  const [geofenceDebugDetails, setGeofenceDebugDetails] = useState<GeofenceDebugDetails | null>(null);
  const [geofenceFailureDetails, setGeofenceFailureDetails] = useState<GeofenceFailureDetails | null>(null);
  const [rules, setRules] = useState({
    requirePhoto: false,
    askPhone: true,
    askId: true,
    askHost: false,
    askPurpose: false,
    askVehicle: false,
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [verifiedGateId, setVerifiedGateId] = useState<string | null>(null);
  const [gateName, setGateName] = useState<string | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: "",
    phone: "",
    id_number: "",
    doc_type: "National ID",
    host_id: "",
    purpose: "",
    vehicle_reg: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const [isHostDropdownOpen, setIsHostDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsHostDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;

      const tParam = searchParams.get("t");
      if (tParam) {
        const qrTime = parseInt(tParam, 10);
        if (Date.now() - qrTime > 300000) {
          setIsQrExpired(true);
          setLoading(false);
          return;
        }
      }

      setGeofenceDebugDetails(null);
      setGeofenceFailureDetails(null);

      const companyResponse = await fetch(`/api/public/company?company_id=${companyId}`, {
        cache: "no-store",
      });
      const companyJson = await companyResponse.json();
      const company = companyJson.data;

      if (!companyResponse.ok || !company) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      console.log("Public gate company debug", {
        companyIdFromUrl: companyId,
        gateIdFromUrl: urlGateId,
        apiCompanyId: company.id,
        apiCompanyName: company.name,
      });

      const basePlanTier = getBasePlan(company.plan_tier);
      setCompanyName(company.name);
      setPlanTier(basePlanTier);
      setRules({
        requirePhoto: basePlanTier === "basic" ? false : company.require_photo || false,
        askPhone: company.ask_phone !== false,
        askId: company.ask_id !== false,
        askHost: company.ask_host || false,
        askPurpose: company.ask_purpose || false,
        askVehicle: company.ask_vehicle || false,
      });

      if (company.custom_fields) {
        setCustomFields((company.custom_fields as CustomField[]).filter((field) => field.active));
      }

      let resolvedGateId: string | null = null;

      try {
        if (urlGateId) {
          const gatesRes = await fetch(`/api/gates?company_id=${companyId}`);
          if (gatesRes.ok) {
            const gatesJson = await gatesRes.json();
            const gate = (gatesJson.data || []).find((item: { id: string; name: string }) => item.id === urlGateId);
            if (gate) {
              resolvedGateId = gate.id;
              setVerifiedGateId(gate.id);
              setGateName(gate.name);
            } else {
              if (process.env.NODE_ENV === "development") {
                console.warn("Geofence debug: QR gateId was not found for company", {
                  gateId: urlGateId,
                  companyId,
                });
              }
              setVerifiedGateId(null);
              setGateName(null);
            }
          }
        } else {
          setVerifiedGateId(null);
          setGateName(null);
        }

        const deptsRes = await fetch(`/api/departments?company_id=${companyId}`);
        if (deptsRes.ok) {
          const deptsJson = await deptsRes.json();
          if (deptsJson.data) setDepartments(deptsJson.data);
        }

        const hostsRes = await fetch(`/api/hosts?company_id=${companyId}`);
        if (hostsRes.ok) {
          const hostsJson = await hostsRes.json();
          if (hostsJson.data) setHosts(hostsJson.data);
        }
      } catch (err) {
        console.error("Error fetching hosts/departments", err);
      }

      if (company.enable_geofence && basePlanTier !== "basic" && company.lat !== null && company.lng !== null) {
        if (!navigator.geolocation) {
          setGeofenceError("Geolocation is not supported by your browser. Please register manually with the guard.");
          setLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const currentLat = pos.coords.latitude;
            const currentLng = pos.coords.longitude;
            const allowedLat = Number(company.lat);
            const allowedLng = Number(company.lng);
            const accuracyMeters = pos.coords.accuracy;
            const radiusMeters = company.geofence_radius || 200;
            const distanceMeters = getDistanceInMeters(currentLat, currentLng, allowedLat, allowedLng);
            const gateId = resolvedGateId || urlGateId || null;
            const geofenceDebug = {
              currentLat,
              currentLng,
              allowedLat,
              allowedLng,
              accuracyMeters,
              radiusMeters,
              distanceMeters,
              companyId,
              gateId,
              companyName: company.name,
            };

            console.log("Geofence debug", geofenceDebug);

            if (accuracyMeters > radiusMeters) {
              setGeofenceDebugDetails(geofenceDebug);
              setGeofenceFailureDetails({ distanceMeters, radiusMeters, accuracyMeters });
              setGeofenceError("Your device location is not accurate enough. Move near the entrance, enable precise location, then try again.");
            } else if (distanceMeters > radiusMeters) {
              setGeofenceDebugDetails(geofenceDebug);
              setGeofenceFailureDetails({ distanceMeters, radiusMeters, accuracyMeters });
              setGeofenceError("You appear to be outside the allowed check-in area.");
            }
            setLoading(false);
          },
          (err) => {
            console.error("Geolocation error:", err);
            if (err.code === err.PERMISSION_DENIED) {
              setGeofenceError("Please allow location access to continue.");
            } else {
              setGeofenceError("We could not confirm your location. Move near the entrance, enable precise location, then try again.");
            }
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId, searchParams, urlGateId]);

  const filteredDepartments = useMemo(() => {
    return departments
      .map((department) => ({
        ...department,
        hosts: hosts.filter(
          (host) => host.department_id === department.id && host.name.toLowerCase().includes(hostSearchQuery.toLowerCase())
        ),
      }))
      .filter((department) => department.hosts.length > 0);
  }, [departments, hostSearchQuery, hosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validatePublicRegistration({
      visitor: newVisitor,
      rules,
      hasSelfie: Boolean(selfieFile),
      agreedToTerms,
    });
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    let uploadedPhotoUrl = null;

    try {
      let finalPhone = null;
      if (rules.askPhone && newVisitor.phone) {
        finalPhone = newVisitor.phone.startsWith("+") ? newVisitor.phone : `+${newVisitor.phone}`;
      }

      const redFlagsRes = await fetch(`/api/red-flags?company_id=${companyId}`);
      if (redFlagsRes.ok) {
        const redFlagsJson = await redFlagsRes.json();
        const blacklisted = (redFlagsJson.data || []) as RedFlag[];
        const isBanned = blacklisted.find((flag) => {
          const matchId = rules.askId && flag.id_number && newVisitor.id_number && flag.id_number.trim() === newVisitor.id_number.trim();
          const matchPhone = rules.askPhone && flag.phone && finalPhone && flag.phone.trim() === finalPhone.trim();
          const matchName = flag.name && newVisitor.name && flag.name.trim().toLowerCase() === newVisitor.name.trim().toLowerCase();

          if (matchId || matchPhone) return true;
          if (matchName) {
            const hasDifferentId = rules.askId && newVisitor.id_number && flag.id_number && newVisitor.id_number.trim() !== flag.id_number.trim();
            const hasDifferentPhone = rules.askPhone && finalPhone && flag.phone && finalPhone.trim() !== flag.phone.trim();
            return !(hasDifferentId || hasDifferentPhone);
          }
          return false;
        });

        if (isBanned) {
          alert(`ACCESS DENIED: You are restricted from entering the premises.\n\nReason: ${isBanned.reason}`);
          return;
        }
      }

      if (selfieFile) {
        const compressedFile = await compressImage(selfieFile);
        const formDataPayload = new FormData();
        formDataPayload.append("file", compressedFile);
        formDataPayload.append("companyId", companyId);

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formDataPayload });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedPhotoUrl = uploadData.url;
        } else {
          throw new Error(uploadData.error || uploadData.message || "Backend rejected the photo for an unknown reason.");
        }
      }

      const registerRes = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          name: newVisitor.name,
          phone: finalPhone || "",
          document_type: rules.askId ? newVisitor.doc_type : null,
          id_number: rules.askId ? newVisitor.id_number : null,
          host_id: rules.askHost && newVisitor.host_id ? newVisitor.host_id : null,
          host_name: rules.askHost && newVisitor.host_id ? hostSearchQuery : null,
          purpose: rules.askPurpose ? newVisitor.purpose : null,
          vehicle_reg: rules.askVehicle ? newVisitor.vehicle_reg : null,
          photo_url: uploadedPhotoUrl,
          custom_data: customAnswers,
          gate_id: verifiedGateId,
        }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.error || "Failed to submit registration.");
      }

      if (rules.askHost && newVisitor.host_id && planTier !== "basic") {
        const selectedHost = hosts.find((host) => host.id === newVisitor.host_id);
        if (selectedHost?.email) {
          try {
            await fetch("/api/notify-host", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                hostEmail: selectedHost.email,
                hostName: selectedHost.name,
                visitorName: newVisitor.name,
                visitorPhone: finalPhone || "Not provided",
                companyName,
                purpose: newVisitor.purpose || "Not stated",
                visitorPhoto: uploadedPhotoUrl,
                companyId,
              }),
            });
          } catch (notifyError) {
            console.error("Failed to trigger host notification:", notifyError);
          }
        }
      }

      setHostSearchQuery("");
      setIsHostDropdownOpen(false);
      setSubmitted(true);
    } catch (err) {
      const message = getSupabaseErrorMessage(err, "Failed to submit registration.");
      console.error("Failed to submit public visitor registration:", err);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewVisitorChange = (visitor: VisitorFormData) => {
    setNewVisitor(visitor);
    setValidationErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      if (visitor.name.trim().length >= 2) delete nextErrors.name;
      if (visitor.host_id) delete nextErrors.host_id;

      if (visitor.phone.replace(/\D/g, "")) delete nextErrors.phone;
      if (visitor.id_number.trim()) delete nextErrors.id_number;

      return nextErrors;
    });
  };

  const handleSelfieFileChange = (file: File) => {
    setSelfieFile(file);
    setValidationErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors.selfie;
      return nextErrors;
    });
  };

  const handleAgreedToTermsChange = (value: boolean) => {
    setAgreedToTerms(value);
    if (value) {
      setValidationErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors.terms;
        return nextErrors;
      });
    }
  };

  return {
    loading,
    companyName,
    gateName,
    accessDenied,
    submitted,
    isQrExpired,
    geofenceError,
    geofenceFailureDetails,
    geofenceDebugDetails,
    rules,
    customFields,
    customAnswers,
    newVisitor,
    hostSearchQuery,
    isHostDropdownOpen,
    filteredDepartments,
    selfiePreview,
    isSubmitting,
    agreedToTerms,
    validationErrors,
    selfieInputRef,
    dropdownRef,
    handleSubmit,
    setNewVisitor: handleNewVisitorChange,
    setHostSearchQuery,
    setIsHostDropdownOpen,
    setCustomAnswers,
    setSelfieFile: handleSelfieFileChange,
    setSelfiePreview,
    setAgreedToTerms: handleAgreedToTermsChange,
  };
}
