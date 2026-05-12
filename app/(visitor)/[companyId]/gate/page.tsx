"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, AlertOctagon, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image-compression";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

// Haversine formula to calculate exact distance between two GPS coordinates in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth's radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
}

function CheckInFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const companyId = params.companyId as string;
  const urlGateId = searchParams.get("gateId"); 

  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- SECURITY & LIMIT STATES ---
  const [isQrExpired, setIsQrExpired] = useState(false);
  const [geofenceError, setGeofenceError] = useState<string | null>(null);

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
    const initializeGate = async () => {
      if (!companyId) return;

      // 1. SECURITY CHECK: Dynamic QR Expiration (5 mins)
      const tParam = searchParams.get("t");
      if (tParam) {
        const qrTime = parseInt(tParam, 10);
        if (Date.now() - qrTime > 300000) {
          setIsQrExpired(true);
          setLoading(false);
          return; 
        }
      }

      // 2. Fetch Company Data (Now includes Geofence coords)
      const { data: company, error } = await supabase
        .from("companies")
        .select("name, is_locked, subscription_ends_at, require_photo, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle, custom_fields, enable_geofence, lat, lng, geofence_radius")
        .eq("id", companyId)
        .single();

      if (error || !company || company.is_locked) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

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

      // 4. SECURITY CHECK: Geofencing Location Check
      // Only runs if the company explicitly enabled it in their settings and provided coordinates
      if (company.enable_geofence && company.lat && company.lng) {
        if (!navigator.geolocation) {
           setGeofenceError("Geolocation is not supported by your browser. Please register manually with the guard.");
           setLoading(false);
           return;
        }

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const dist = getDistance(pos.coords.latitude, pos.coords.longitude, company.lat!, company.lng!);
            const maxRadius = company.geofence_radius || 200;
            
            if (dist > maxRadius) {
              setGeofenceError(`You are too far from the building to register. Please move closer to the gate. (Currently ~${Math.round(dist)}m away, limit is ${maxRadius}m)`);
            }
            setLoading(false); // Stop loading after location is verified
          },
          (err) => {
            console.error("Geolocation error:", err);
            setGeofenceError("Location access is required to check in. Please allow GPS access when prompted, or see the guard.");
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        setLoading(false); // End loading immediately if no geofence is required
      }
    };

    initializeGate();
  }, [companyId, searchParams]);

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

      // 4. Notify the host if a host was selected
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

  // --- UI RENDER STATES ---

  if (loading) {
    return <GateLoadingState />;
  }

  // 1. QR EXPIRED STATE
  if (isQrExpired) {
    return (
      <div className="w-full max-w-md mx-auto relative z-10 px-4">
        <Card className="border-zinc-200 shadow-xl text-center p-8 bg-white/95 backdrop-blur-md">
          <AlertOctagon className="w-20 h-20 text-amber-500 mx-auto mb-6" />
          <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight mb-2">QR Code Expired</CardTitle>
          <p className="text-zinc-500 font-medium leading-relaxed">
            For security reasons, this dynamic QR code has expired. Please return to the security desk and scan the code again.
          </p>
        </Card>
      </div>
    );
  }

  // 2. GEOFENCE BLOCKED STATE
  if (geofenceError) {
    return (
      <div className="w-full max-w-md mx-auto relative z-10 px-4">
        <Card className="border-red-100 shadow-xl text-center p-8 bg-white/95 backdrop-blur-md">
          <MapPin className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Location Required</CardTitle>
          <p className="text-zinc-600 font-medium leading-relaxed mb-8">
            {geofenceError}
          </p>
          <Button onClick={() => window.location.reload()} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-12 shadow-md">
            Try Again
          </Button>
        </Card>
      </div>
    );
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