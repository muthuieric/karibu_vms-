"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image-compression";
import { getSupabaseErrorMessage } from "@/lib/supabase-error";
import AddVisitorForm from "@/components/dashboard/guard/add-visitor/AddVisitorForm";
import "react-phone-input-2/lib/style.css";
import type { Visitor } from "@/types/guard";

type CustomField = {
  id: string;
  label: string;
  active: boolean;
};

type Department = { id: string; name: string };
type Host = { id: string; name: string; phone: string; email: string; department_id: string };
type RedFlag = {
  id_number?: string | null;
  phone?: string | null;
  name?: string | null;
  reason?: string | null;
};

export interface AddVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string | null;
  requirePhoto: boolean;
  askPhone: boolean;
  askId: boolean;
  askHost?: boolean;
  askPurpose?: boolean;
  askVehicle?: boolean;
  guardGateId?: string | null;
  onVisitorAdded?: (visitor: Visitor) => void;
}

export default function AddVisitorModal({
  isOpen,
  onClose,
  companyId,
  requirePhoto,
  askPhone,
  askId,
  askHost = false,
  askPurpose = false,
  askVehicle = false,
  guardGateId = null,
  onVisitorAdded,
}: AddVisitorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    name: "", phone: "", id_number: "", doc_type: "National ID", host_id: "", purpose: "", vehicle_reg: ""
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const [departments, setDepartments] = useState<Department[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);

  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const [isHostDropdownOpen, setIsHostDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // NEW: Terms and Conditions State
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [planTier, setPlanTier] = useState("basic");

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
    const fetchCustomFields = async () => {
      if (!companyId || !isOpen) return;
      const { data } = await supabase
        .from("companies")
        .select("name, plan_tier, custom_fields")
        .eq("id", companyId)
        .single();

      if (data) {
        setCompanyName(data.name || "");
        setPlanTier(data.plan_tier || "basic");
        if (data.custom_fields) {
          const activeFields = (data.custom_fields as CustomField[]).filter(f => f.active);
          setCustomFields(activeFields);
        }
      }
    };

    const fetchDepartmentsAndHosts = async () => {
      if (!companyId || !isOpen) return;
      try {
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
      } catch (error) {
        console.error("Error fetching hosts/departments", error);
      }
    };

    fetchCustomFields();
    fetchDepartmentsAndHosts();
  }, [companyId, isOpen]);

  const filteredDepartments = departments.map(dept => {
    const deptHosts = hosts.filter(h =>
      h.department_id === dept.id &&
      h.name.toLowerCase().includes(hostSearchQuery.toLowerCase())
    );
    return { ...dept, hosts: deptHosts };
  }).filter(dept => dept.hosts.length > 0);

  if (!isOpen) return null;

  const handleAddVisitor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId) {
      alert("Could not identify your building assignment. Please refresh the page.");
      return;
    }

    if (!agreedToTerms) {
      alert("You must agree to the Terms and Conditions to register.");
      return;
    }

    if (requirePhoto && !selfieFile) {
      alert("A security photo is required by building management.");
      return;
    }

    if (askHost && !newVisitor.host_id) {
      alert("Please select a valid host from the dropdown list.");
      return;
    }

    setIsSubmitting(true);
    let uploadedPhotoUrl = null;

    try {
      let finalPhone = null;
      if (askPhone && newVisitor.phone) {
        finalPhone = newVisitor.phone.startsWith("+") ? newVisitor.phone : `+${newVisitor.phone}`;
      }

      // 1. ROBUST BLACKLIST SECURITY CHECK
      const redFlagsRes = await fetch(`/api/red-flags?company_id=${companyId}`);
      if (redFlagsRes.ok) {
        const redFlagsJson = await redFlagsRes.json();
        const blacklisted = (redFlagsJson.data || []) as RedFlag[];

        if (blacklisted.length > 0) {
          const isBanned = blacklisted.find((flag) => {
            const matchId = askId && flag.id_number && newVisitor.id_number && flag.id_number.trim() === newVisitor.id_number.trim();
            const matchPhone = askPhone && flag.phone && finalPhone && flag.phone.trim() === finalPhone.trim();
            const matchName = flag.name && newVisitor.name && flag.name.trim().toLowerCase() === newVisitor.name.trim().toLowerCase();

            if (matchId || matchPhone) return true;

            if (matchName) {
              const hasDifferentId = askId && newVisitor.id_number && flag.id_number && newVisitor.id_number.trim() !== flag.id_number.trim();
              const hasDifferentPhone = askPhone && finalPhone && flag.phone && finalPhone.trim() !== flag.phone.trim();
              if (hasDifferentId || hasDifferentPhone) return false;
              return true;
            }
            return false;
          });

          if (isBanned) {
            alert(`ACCESS DENIED: This visitor is restricted from entering the building.\n\nReason: ${isBanned.reason}`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // 2. Upload Selfie
      if (selfieFile) {
        const compressedFile = await compressImage(selfieFile);

        const formDataPayload = new FormData();
        formDataPayload.append("file", compressedFile);
        formDataPayload.append("companyId", companyId);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formDataPayload,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedPhotoUrl = uploadData.url;
        } else {
          throw new Error("Failed to securely upload security photo.");
        }
      }

      // 3. Insert Visitor Record
      const finalGateId = guardGateId && guardGateId !== "" && guardGateId !== "unassigned" ? guardGateId : null;

      const insertPayload = {
        company_id: companyId,
        name: newVisitor.name.trim(),
        phone: finalPhone || "",
        document_type: askId ? newVisitor.doc_type : null,
        id_number: askId ? newVisitor.id_number.trim() : null,
        host_id: askHost && newVisitor.host_id ? newVisitor.host_id : null,
        host_name: askHost && newVisitor.host_id ? hostSearchQuery : null,
        purpose: askPurpose ? newVisitor.purpose.trim() || null : null,
        vehicle_reg: askVehicle ? newVisitor.vehicle_reg.trim() || null : null,
        status: "pending",
        photo_url: uploadedPhotoUrl,
        custom_data: { ...customAnswers, source: "guard_desk" },
        gate_id: finalGateId,
      };

      const { data: createdVisitor, error } = await supabase
        .from("visitors")
        .insert([insertPayload])
        .select("*")
        .single();

      if (error) {
        console.error("Supabase visitor insert failed:", {
          error,
          payload: insertPayload,
        });
        throw new Error(getSupabaseErrorMessage(error, "Failed to add visitor."));
      }

      if (createdVisitor) {
        onVisitorAdded?.(createdVisitor as Visitor);
      }

      if (askHost && newVisitor.host_id && planTier !== "basic") {
        const selectedHost = hosts.find((h) => h.id === newVisitor.host_id);

        if (selectedHost && selectedHost.email) {
          try {
            await fetch('/api/notify-host', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                hostEmail: selectedHost.email,
                hostName: selectedHost.name,
                visitorName: newVisitor.name,
                visitorPhone: finalPhone || 'Not provided',
                companyName: companyName,
                purpose: newVisitor.purpose || 'Not stated',
                visitorPhoto: uploadedPhotoUrl,
                companyId: companyId
              })
            });
          } catch (notifyError) {
            console.error("Failed to trigger host notification:", notifyError);
          }
        }
      }

      // Reset form
      setNewVisitor({ name: "", phone: "", id_number: "", doc_type: "National ID", host_id: "", purpose: "", vehicle_reg: "" });
      setHostSearchQuery("");
      setCustomAnswers({});
      setSelfieFile(null);
      setSelfiePreview(null);
      setAgreedToTerms(false);
      onClose();

    } catch (err) {
      const message = getSupabaseErrorMessage(err, "Failed to add visitor.");
      console.error("Failed to add visitor:", err);
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AddVisitorForm
      askPhone={askPhone}
      askId={askId}
      askHost={askHost}
      askPurpose={askPurpose}
      askVehicle={askVehicle}
      requirePhoto={requirePhoto}
      isSubmitting={isSubmitting}
      newVisitor={newVisitor}
      customFields={customFields}
      customAnswers={customAnswers}
      hostSearchQuery={hostSearchQuery}
      isHostDropdownOpen={isHostDropdownOpen}
      filteredDepartments={filteredDepartments}
      selfiePreview={selfiePreview}
      agreedToTerms={agreedToTerms}
      selfieInputRef={selfieInputRef}
      dropdownRef={dropdownRef}
      onClose={onClose}
      onSubmit={handleAddVisitor}
      onNewVisitorChange={setNewVisitor}
      onCustomAnswersChange={setCustomAnswers}
      onHostSearchQueryChange={setHostSearchQuery}
      onHostDropdownOpenChange={setIsHostDropdownOpen}
      onSelfieFileChange={setSelfieFile}
      onSelfiePreviewChange={setSelfiePreview}
      onAgreedToTermsChange={setAgreedToTerms}
    />
  );
}
