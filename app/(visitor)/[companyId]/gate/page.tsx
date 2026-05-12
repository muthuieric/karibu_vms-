"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image-compression";
import GateAccessDeniedState from "@/components/visitor/gate/GateAccessDeniedState";
import GateLoadingState from "@/components/visitor/gate/GateLoadingState";
import GateSuccessState from "@/components/visitor/gate/GateSuccessState";
import VisitorCheckInForm from "@/components/visitor/gate/VisitorCheckInForm";
import "react-phone-input-2/lib/style.css";

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

function CheckInFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const companyId = params.companyId as string;
  const urlGateId = searchParams.get("gateId"); 

  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rules, setRules] = useState({
    requirePhoto: false,
    askPhone: true,
    askId: true,
    askHost: false,
    askPurpose: false,
    askVehicle: false
  });
  
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVisitor, setNewVisitor] = useState({ 
    name: "", phone: "", id_number: "", doc_type: "National ID", host_id: "", purpose: "", vehicle_reg: "" 
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [hosts, setHosts] = useState<Host[]>([]);
  
  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const [isHostDropdownOpen, setIsHostDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NEW: Terms and Conditions State
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

      const { data: company, error } = await supabase
        .from("companies")
        .select("name, is_locked, subscription_ends_at, require_photo, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle, custom_fields")
        .eq("id", companyId)
        .single();

      if (error || !company) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      // --- TEMPORARILY PAUSED SUBSCRIPTION EXPIRATION LOGIC ---
      // We are commenting this out so manual payments don't block the system.
      // const isExpired = company.subscription_ends_at ? new Date(company.subscription_ends_at) < new Date() : false;
      
      // Now it ONLY checks the manual toggle from your Super Admin dashboard
      if (company.is_locked /* || isExpired */) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }
      // ---------------------------------------------------------

      setCompanyName(company.name);
      setRules({
        requirePhoto: company.require_photo || false,
        askPhone: company.ask_phone !== false,
        askId: company.ask_id !== false,
        askHost: company.ask_host || false,
        askPurpose: company.ask_purpose || false,
        askVehicle: company.ask_vehicle || false
      });
      
      if (company.custom_fields) {
        const activeFields = (company.custom_fields as CustomField[]).filter(f => f.active);
        setCustomFields(activeFields);
      }

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
      } catch (err) {
        console.error("Error fetching hosts/departments", err);
      }

      setLoading(false);
    };

    fetchCompanyData();
  }, [companyId]);

  const filteredDepartments = departments.map(dept => {
    const deptHosts = hosts.filter(h => 
      h.department_id === dept.id && 
      h.name.toLowerCase().includes(hostSearchQuery.toLowerCase())
    );
    return { ...dept, hosts: deptHosts };
  }).filter(dept => dept.hosts.length > 0);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const compressedFile = await compressImage(file);
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      
      reader.onloadend = async () => {
        const base64data = reader.result;
        const response = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64data }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          setNewVisitor((prev) => ({
            ...prev,
            name: result.data.FullName || prev.name,
            id_number: result.data.IDNumber || prev.id_number,
          }));
        } else {
          alert("Could not read the ID clearly. Please type it manually.");
        }
        setIsScanning(false);
      };
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      alert("Error scanning ID. Please try manually.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      alert("You must agree to the Terms and Conditions to proceed.");
      return;
    }

    if (rules.requirePhoto && !selfieFile) {
      alert("A security photo is required by building management.");
      return;
    }

    if (rules.askHost && !newVisitor.host_id) {
      alert("Please select a valid host from the dropdown list.");
      return;
    }

    setIsSubmitting(true);
    let uploadedPhotoUrl = null;

    try {
      let finalPhone = null;
      if (rules.askPhone && newVisitor.phone) {
        finalPhone = newVisitor.phone.startsWith('+') ? newVisitor.phone : `+${newVisitor.phone}`;
      }

      // 1. ROBUST BLACKLIST SECURITY CHECK
      const redFlagsRes = await fetch(`/api/red-flags?company_id=${companyId}`);
      if (redFlagsRes.ok) {
        const redFlagsJson = await redFlagsRes.json();
        const blacklisted = (redFlagsJson.data || []) as RedFlag[];

        if (blacklisted.length > 0) {
          const isBanned = blacklisted.find((flag) => {
            const matchId = rules.askId && flag.id_number && newVisitor.id_number && flag.id_number.trim() === newVisitor.id_number.trim();
            const matchPhone = rules.askPhone && flag.phone && finalPhone && flag.phone.trim() === finalPhone.trim();
            const matchName = flag.name && newVisitor.name && flag.name.trim().toLowerCase() === newVisitor.name.trim().toLowerCase();
            
            if (matchId || matchPhone) return true;

            if (matchName) {
              const hasDifferentId = rules.askId && newVisitor.id_number && flag.id_number && newVisitor.id_number.trim() !== flag.id_number.trim();
              const hasDifferentPhone = rules.askPhone && finalPhone && flag.phone && finalPhone.trim() !== flag.phone.trim();
              
              if (hasDifferentId || hasDifferentPhone) return false;
              return true; 
            }
            return false;
          });

          if (isBanned) {
            alert(`ACCESS DENIED: You are restricted from entering the premises.\n\nReason: ${isBanned.reason}`);
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
          throw new Error(uploadData.error || uploadData.message || "Backend rejected the photo for an unknown reason.");
        }
      }

      // 3. Insert Visitor Record
      const { error } = await supabase.from("visitors").insert([
        {
          company_id: companyId,
          name: newVisitor.name,
          phone: finalPhone,
          document_type: rules.askId ? newVisitor.doc_type : null,
          id_number: rules.askId ? newVisitor.id_number : null,
          host_id: rules.askHost && newVisitor.host_id ? newVisitor.host_id : null,
          host_name: rules.askHost && newVisitor.host_id ? hostSearchQuery : null, 
          purpose: rules.askPurpose ? newVisitor.purpose : null,
          vehicle_reg: rules.askVehicle ? newVisitor.vehicle_reg : null,
          status: "pending",
          photo_url: uploadedPhotoUrl,
          custom_data: customAnswers,
          gate_id: urlGateId || null 
        }
      ]);

      if (error) throw error;

      // 4. NEW FIX: Notify the host if a host was selected
      if (rules.askHost && newVisitor.host_id) {
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
            // Non-blocking error, user still sees success screen
          }
        }
      }

      setSubmitted(true);

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Failed to submit registration.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <GateLoadingState />;
  }

  if (accessDenied) {
    return <GateAccessDeniedState />;
  }

  if (submitted) {
    return <GateSuccessState />;
  }

  return (
    <VisitorCheckInForm
      companyName={companyName}
      rules={rules}
      customFields={customFields}
      customAnswers={customAnswers}
      newVisitor={newVisitor}
      hostSearchQuery={hostSearchQuery}
      isHostDropdownOpen={isHostDropdownOpen}
      filteredDepartments={filteredDepartments}
      selfiePreview={selfiePreview}
      isScanning={isScanning}
      isSubmitting={isSubmitting}
      agreedToTerms={agreedToTerms}
      fileInputRef={fileInputRef}
      selfieInputRef={selfieInputRef}
      dropdownRef={dropdownRef}
      onImageCapture={handleImageCapture}
      onSubmit={handleSubmit}
      onNewVisitorChange={setNewVisitor}
      onHostSearchQueryChange={setHostSearchQuery}
      onHostDropdownOpenChange={setIsHostDropdownOpen}
      onCustomAnswersChange={setCustomAnswers}
      onSelfieFileChange={setSelfieFile}
      onSelfiePreviewChange={setSelfiePreview}
      onAgreedToTermsChange={setAgreedToTerms}
    />
  );
}

export default function PublicGateCheckInWrapper() {
  return (
    <div className="min-h-screen bg-zinc-50 p-4 py-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[300px] w-[300px] rounded-full bg-amber-400/20 blur-[100px] pointer-events-none" />
      
      <Suspense fallback={
        <div className="flex flex-col items-center z-10">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        </div>
      }>
        <CheckInFormContent />
      </Suspense>
    </div>
  );
}
