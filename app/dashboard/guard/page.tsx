"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X, UserCircle, LogOut, Search, Clock, CheckCircle2, UserPlus, Info, DoorOpen, QrCode, Printer, ShieldCheck, RefreshCw } from "lucide-react";

import AddVisitorModal from "@/components/dashboard/guard/add-visitor/AddVisitorModal";

type Visitor = {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "checked_in" | "checked_out" | "auto_checked_out";
  created_at: string;
  checked_in_at?: string;
  document_type: string;
  id_number?: string;
  otp_code?: string;
  company_id: string;
  photo_url?: string;
  host_name?: string;
  host_confirmed?: boolean; 
  purpose?: string;
  vehicle_reg?: string;
  custom_data?: Record<string, string>; 
  gate_id?: string | null; 
};

export default function GuardDashboard() {
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [planTier, setPlanTier] = useState<string>("basic"); // NEW: Track the plan
  const [guardGateId, setGuardGateId] = useState<string | null>(null);
  const [guardGateName, setGuardGateName] = useState<string>("All Gates");
  const [customFieldLabels, setCustomFieldLabels] = useState<Record<string, string>>({});
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "checked_in">("all");

  const [requirePhoto, setRequirePhoto] = useState<boolean>(false);
  const [askPhone, setAskPhone] = useState<boolean>(true);
  const [askId, setAskId] = useState<boolean>(true);
  const [askHost, setAskHost] = useState<boolean>(false);
  const [askPurpose, setAskPurpose] = useState<boolean>(false);
  const [askVehicle, setAskVehicle] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [sendingOtpId, setSendingOtpId] = useState<string | null>(null); 
  const [otpInput, setOtpInput] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [infoModalVisitor, setInfoModalVisitor] = useState<Visitor | null>(null);
  
  const [qrTimestamp, setQrTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrModal) {
      setQrTimestamp(Date.now()); 
      interval = setInterval(() => {
        setQrTimestamp(Date.now()); 
      }, 300000); 
    }
    return () => clearInterval(interval);
  }, [showQrModal]);
  
  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error("Authentication error:", authError);
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("company_id, gate_id")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profileData?.company_id) {
        console.error("Could not load guard profile:", profileError);
        setLoading(false);
        return;
      }

      const currentCompanyId = profileData.company_id;
      const currentGateId = profileData.gate_id;
      
      setCompanyId(currentCompanyId);
      setGuardGateId(currentGateId);

      if (currentGateId) {
        const { data: gateData } = await supabase
          .from("gates")
          .select("name")
          .eq("id", currentGateId)
          .single();
          
        if (gateData) setGuardGateName(gateData.name);
      }

      const { data: companyData } = await supabase
        .from("companies")
        .select("require_photo, ask_phone, ask_id, ask_host, ask_purpose, ask_vehicle, custom_fields, is_locked, subscription_ends_at, plan_tier")
        .eq("id", currentCompanyId)
        .single();
        
      if (companyData) {
        setPlanTier(companyData.plan_tier || "basic");
        setRequirePhoto(companyData.require_photo || false);
        setAskPhone(companyData.ask_phone !== false);
        setAskId(companyData.ask_id !== false);
        setAskHost(companyData.ask_host || false);
        setAskPurpose(companyData.ask_purpose || false);
        setAskVehicle(companyData.ask_vehicle || false);

        const isExpired = companyData.subscription_ends_at ? new Date(companyData.subscription_ends_at) < new Date() : false;
        setIsLocked(companyData.is_locked || isExpired);

        if (companyData.custom_fields) {
          const labelMap: Record<string, string> = {};
          // @ts-ignore
          companyData.custom_fields.forEach((f: any) => {
            labelMap[f.id] = f.label;
          });
          setCustomFieldLabels(labelMap);
        }
      }

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      try {
        await supabase
          .from("visitors")
          .update({ 
            status: "auto_checked_out", 
            checked_out_at: new Date().toISOString(),
            otp_code: null
          })
          .eq("company_id", currentCompanyId)
          .in("status", ["pending", "checked_in"])
          .lt("created_at", startOfToday.toISOString());
      } catch (err) {
        console.error("Auto-checkout script failed:", err);
      }

      let query = supabase
        .from("visitors")
        .select("*")
        .eq("company_id", currentCompanyId) 
        .gte("created_at", startOfToday.toISOString())
        .in("status", ["pending", "checked_in"])
        .order("created_at", { ascending: false });

      if (currentGateId) {
        query = query.eq("gate_id", currentGateId);
      }

      const { data: visitorData, error: visitorError } = await query;

      if (!visitorError) {
        setVisitors(visitorData || []);
      }
      setLoading(false);

      const channel = supabase
        .channel("guard-dashboard")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "visitors" },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newVisitor = payload.new as Visitor;
              if (!currentGateId || newVisitor.gate_id === currentGateId) {
                setVisitors((prev) => [newVisitor, ...prev]);
              }
            } else if (payload.eventType === "UPDATE") {
              if (payload.new.status === "checked_out" || payload.new.status === "auto_checked_out") {
                setVisitors((prev) => prev.filter((v) => v.id !== payload.new.id));
              } else {
                setVisitors((prev) =>
                  prev.map((v) => (v.id === payload.new.id ? (payload.new as Visitor) : v))
                );
              }
              
              setInfoModalVisitor((prev) => 
                prev?.id === payload.new.id ? (payload.new as Visitor) : prev
              );
            } else if (payload.eventType === "DELETE") {
              setVisitors((prev) => prev.filter((v) => v.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    const cleanup = initializeDashboard();
    return () => { cleanup.then(fn => fn && fn()); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // --- NEW: DIRECT APPROVE FOR BASIC PLAN (No OTP Cost) ---
  const handleDirectApprove = async (visitor: Visitor) => {
    await supabase.from("visitors").update({ 
      status: "checked_in",
      checked_in_at: new Date().toISOString()
    }).eq("id", visitor.id);
  };

  // --- NEW: MANUAL OVERRIDE (Premium/Custom) ---
  const handleManualOverride = async (visitor: Visitor) => {
    if (!window.confirm("Bypass OTP security and manually check in this visitor?")) return;
    
    await supabase.from("visitors").update({ 
      status: "checked_in",
      checked_in_at: new Date().toISOString(),
      custom_data: { ...(visitor.custom_data || {}), manual_override: "true" }
    }).eq("id", visitor.id);
  };

  // --- PREMIUM/CUSTOM ONLY: OTP LOGIC ---
  const handleSendOTP = async (id: string, phone: string) => {
    if (sendingOtpId === id) return; 
    setSendingOtpId(id); 

    try {
      let code = "";
      let isUnique = false;
      while (!isUnique) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        const { data } = await supabase.from("visitors").select("id").eq("otp_code", code).in("status", ["pending", "checked_in"]);
        if (!data || data.length === 0) isUnique = true; 
      }
      
      await supabase.from("visitors").update({ otp_code: code }).eq("id", id);
      setVerifyingId(id);
      setOtpInput("");

      await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phone, 
          message: `Your building entry code is: ${code}` 
        }),
      });
    } catch (err) {
      console.error(err);
      alert(`[SMS API Error] Could not send message. Please try again.`);
    } finally {
      setSendingOtpId(null); 
    }
  };

  const handleConfirmOTP = async (visitor: Visitor) => {
    const { data } = await supabase.from("visitors").select("otp_code").eq("id", visitor.id).single();
    if (!data || data.otp_code !== otpInput.trim()) return alert("Incorrect OTP.");
    
    await supabase.from("visitors").update({ 
      status: "checked_in",
      checked_in_at: new Date().toISOString()
    }).eq("id", visitor.id);
    
    setVerifyingId(null);
  };

  const handleCheckOut = async (id: string) => {
    await supabase.from("visitors").update({ 
      status: "checked_out", 
      checked_out_at: new Date().toISOString(),
      otp_code: null 
    }).eq("id", id);
  };

  const handlePrintQr = () => {
    const url = `${window.location.origin}/${companyId}/gate${guardGateId ? `?gateId=${guardGateId}` : ''}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}`;
    
    const printWindow = window.open('', '', 'width=800,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Gate QR Code</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #18181b; }
              .container { text-align: center; border: 2px dashed #e4e4e7; padding: 40px; border-radius: 24px; max-width: 500px; }
              h1 { margin-bottom: 8px; font-size: 36px; font-weight: 900; letter-spacing: -0.02em; }
              p { color: #71717a; margin-bottom: 32px; font-size: 18px; font-weight: 500; }
              img { width: 300px; height: 300px; display: block; margin: 0 auto; border-radius: 12px; }
              .footer { margin-top: 32px; font-size: 16px; color: #a1a1aa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
              @media print {
                .container { border: none; padding: 0; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Scan to Check In</h1>
              <p>Point your smartphone camera at this code to register your visit.</p>
              <img src="${qrUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 500);" />
              <div class="footer">${guardGateName}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    const query = searchTerm.toLowerCase();
    
    let matchesSearch = v.name?.toLowerCase().includes(query) ||
                        v.phone?.includes(searchTerm) ||
                        v.id_number?.includes(searchTerm) ||
                        v.host_name?.toLowerCase().includes(query) ||
                        v.vehicle_reg?.toLowerCase().includes(query);

    if (!matchesSearch && v.custom_data) {
      matchesSearch = Object.values(v.custom_data).some(val => 
        val && val.toLowerCase().includes(query)
      );
    }

    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  
  const totalToday = visitors.length;
  const checkedInCount = visitors.filter(v => v.status === "checked_in").length;
  const pendingCount = visitors.filter(v => v.status === "pending").length;

  const getDynamicQrUrl = () => {
    if (!companyId) return "";
    const baseUrl = `${window.location.origin}/${companyId}/gate`;
    const queryParams = new URLSearchParams();
    if (guardGateId) queryParams.append("gateId", guardGateId);
    queryParams.append("t", qrTimestamp.toString()); 
    return `${baseUrl}?${queryParams.toString()}`;
  };

  if (!companyId && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-red-600 font-medium">Error: Could not load guard profile. Are you logged in?</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6 relative overflow-x-hidden">
      
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="fixed top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-zinc-400/20 blur-[100px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Gate Dashboard</h1>
            <p className="text-zinc-500 flex items-center gap-1.5 mt-1">
              <DoorOpen className="w-4 h-4" /> 
              Live monitoring • <span className="font-semibold text-zinc-700">{guardGateName}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handleLogout} className="flex-1 sm:flex-initial border-zinc-200 text-zinc-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-white/80 backdrop-blur-sm">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
            <Button variant="outline" onClick={() => setShowQrModal(true)} className="flex-1 sm:flex-initial bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-200 shadow-sm">
              <QrCode className="w-4 h-4 mr-2" /> Show QR
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 shadow-md">
              <UserPlus className="w-4 h-4 mr-2 hidden sm:inline-block" /> + New Visitor
            </Button>
          </div>
        </div>

        {!isLocked && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Total Today</p>
                  <h3 className="text-3xl font-bold text-zinc-900 mt-1">{totalToday}</h3>
                </div>
                <div className="p-3 bg-zinc-100/80 text-zinc-600 rounded-full">
                  <UserPlus className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Pending</p>
                  <h3 className="text-3xl font-bold text-zinc-900 mt-1">{pendingCount}</h3>
                </div>
                <div className="p-3 bg-amber-100/80 text-amber-600 rounded-full">
                  <Clock className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Checked In</p>
                  <h3 className="text-3xl font-bold text-zinc-900 mt-1">{checkedInCount}</h3>
                </div>
                <div className="p-3 bg-green-100/80 text-green-600 rounded-full">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-white/90 backdrop-blur-sm border-zinc-200/60 shadow-sm">
          <CardHeader className="flex flex-col gap-4 border-b border-zinc-100/50 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <CardTitle>Today's Active Visitors</CardTitle>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-9 w-full bg-white/80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex w-full sm:w-auto bg-zinc-100/80 p-1 rounded-md border border-zinc-200/60 overflow-x-auto">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${statusFilter === "all" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-900"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("pending")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${statusFilter === "pending" ? "bg-white shadow-sm text-amber-700" : "text-zinc-500 hover:text-zinc-900"}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter("checked_in")}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded transition-colors whitespace-nowrap ${statusFilter === "checked_in" ? "bg-white shadow-sm text-green-700" : "text-zinc-500 hover:text-zinc-900"}`}
                  >
                    Checked In
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-zinc-500 py-4">Loading secure data...</p>
            ) : filteredVisitors.length === 0 ? (
              <p className="text-zinc-500 py-4">No active visitors match your search.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-200/50">
                      <TableHead>Arrived</TableHead>
                      <TableHead>Visitor Details</TableHead>
                      <TableHead>Phone & ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.map((visitor) => {
                      const hasCustomData = visitor.custom_data && Object.values(visitor.custom_data).some(val => val.trim() !== "");
                      const hasExtraInfo = visitor.host_name || visitor.purpose || visitor.vehicle_reg || hasCustomData;

                      return (
                        <TableRow key={visitor.id} className="border-zinc-200/50 hover:bg-zinc-50/50">
                          <TableCell className="font-medium text-zinc-500 whitespace-nowrap">
                            {new Date(visitor.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {visitor.photo_url ? (
                                <Image 
                                  src={visitor.photo_url} 
                                  alt={`${visitor.name}'s photo`} 
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-zinc-200 cursor-pointer hover:opacity-80 transition-opacity bg-white shrink-0"
                                  onClick={() => setEnlargedPhoto(visitor.photo_url!)}
                                  unoptimized
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border-2 border-zinc-200 text-zinc-400 shrink-0">
                                  <UserCircle className="w-6 h-6" />
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <span className="font-semibold whitespace-nowrap">{visitor.name}</span>
                                {hasExtraInfo && (
                                  <button
                                    onClick={() => setInfoModalVisitor(visitor)}
                                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-full transition-colors shrink-0 shadow-sm border border-blue-100"
                                    title="View Visit Info"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="text-sm whitespace-nowrap">{visitor.phone || "—"}</div>
                            <div className="text-xs text-zinc-500 whitespace-nowrap">{visitor.id_number || "No ID"}</div>
                          </TableCell>
                          
                          <TableCell>
                            {visitor.status === "pending" ? (
                              <span className="inline-flex items-center rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800 whitespace-nowrap border border-amber-200/50">Pending</span>
                            ) : visitor.custom_data?.manual_override === "true" ? (
                              <span className="inline-flex items-center rounded-full bg-purple-100/80 px-2.5 py-0.5 text-xs font-semibold text-purple-800 whitespace-nowrap border border-purple-200/50">Inside (Override)</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-100/80 px-2.5 py-0.5 text-xs font-semibold text-green-800 whitespace-nowrap border border-green-200/50">Checked In</span>
                            )}
                          </TableCell>

                          {/* ACTION COLUMN: Checks Plan Tier */}
                          <TableCell className="text-right">
                            {visitor.status === "pending" ? (
                              planTier === "basic" ? (
                                // BASIC PLAN: Instant Approve (No OTP Cost)
                                <Button 
                                  size="sm" 
                                  onClick={() => handleDirectApprove(visitor)} 
                                  className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Entry
                                </Button>
                              ) : (
                                // PREMIUM/CUSTOM PLAN: Full OTP Flow
                                visitor.custom_data?.source === "guard_desk" ? (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleManualOverride(visitor)} 
                                    className="whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Override
                                  </Button>
                                ) : verifyingId === visitor.id ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <input 
                                      type="text" maxLength={4} placeholder="OTP"
                                      className="w-16 rounded border px-2 py-1 text-center text-sm bg-white"
                                      value={otpInput} onChange={(e) => setOtpInput(e.target.value)}
                                    />
                                    <Button size="sm" onClick={() => handleConfirmOTP(visitor)}>Confirm</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setVerifyingId(null)}>Cancel</Button>
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSendOTP(visitor.id, visitor.phone)} 
                                    disabled={sendingOtpId === visitor.id}
                                    className="whitespace-nowrap bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm disabled:opacity-50"
                                  >
                                    {sendingOtpId === visitor.id ? "Sending..." : "Verify & Send OTP"}
                                  </Button>
                                )
                              )
                            ) : (
                              <Button size="sm" variant="secondary" onClick={() => handleCheckOut(visitor.id)} className="whitespace-nowrap bg-white/60 hover:bg-zinc-100 text-zinc-700 shadow-sm">Check Out</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddVisitorModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        companyId={companyId}
        requirePhoto={requirePhoto}
        askPhone={askPhone}
        askId={askId}
        askHost={askHost}
        askPurpose={askPurpose}
        askVehicle={askVehicle}
        guardGateId={guardGateId}
      />

      {/* --- QR CODE MODAL --- */}
      {showQrModal && companyId && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowQrModal(false)}>
          <Card className="w-full max-w-sm shadow-2xl relative border-0 rounded-xl overflow-hidden bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors">
              <X size={18} />
            </button>
            <CardHeader className="pt-8 pb-2 text-center">
              <CardTitle className="text-2xl font-black text-zinc-900 tracking-tight">Scan to Register</CardTitle>
              <CardDescription className="text-zinc-500 font-medium">
                Visitor Self-Check-In
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 space-y-6">
              <div className="p-4 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm relative group">
                <div className="absolute -top-3 -right-3 bg-blue-100 text-blue-700 p-1.5 rounded-full shadow-sm animate-pulse">
                  <RefreshCw size={16} />
                </div>
                
                <Image 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getDynamicQrUrl())}`}
                  alt="Check-in QR Code"
                  width={250}
                  height={250}
                  className="rounded-lg"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-500 max-w-[250px] mx-auto font-medium">
                  Have the visitor scan this code with their smartphone camera.
                </p>
                <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider mt-2 bg-emerald-50 py-1 px-2 rounded inline-block">
                  <ShieldCheck className="w-3 h-3 inline mr-1 mb-0.5"/> Code auto-rotates for security
                </p>
              </div>

              <div className="w-full flex gap-2">
                <Input readOnly value={getDynamicQrUrl()} className="h-10 text-xs bg-zinc-50 text-zinc-500" />
                <Button 
                  variant="outline" 
                  className="h-10 shrink-0 border-zinc-200"
                  onClick={(e) => {
                    navigator.clipboard.writeText(getDynamicQrUrl());
                    const btn = e.currentTarget;
                    const oldText = btn.innerText;
                    btn.innerText = "Copied!";
                    setTimeout(() => { btn.innerText = oldText; }, 2000);
                  }}
                >
                  Copy
                </Button>
              </div>
              
              <div className="flex gap-3 w-full mt-2 pt-4 border-t border-zinc-100">
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" onClick={handlePrintQr}>
                  <Printer className="w-4 h-4 mr-2" /> Print Static Poster
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- EXTRA VISIT INFO MODAL --- */}
      {infoModalVisitor && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm shadow-2xl relative border-0 overflow-hidden bg-white max-h-[80vh] overflow-y-auto">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
            <button onClick={() => setInfoModalVisitor(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full p-1.5 transition-colors">
              <X size={18} />
            </button>
            <CardHeader className="pt-8 pb-4 border-b border-zinc-100/50">
              <CardTitle className="text-xl font-bold">Visit Details</CardTitle>
              <CardDescription>Extra information provided by {infoModalVisitor.name}.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5 bg-zinc-50/50">
              
              {infoModalVisitor.host_name && (
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Host Name</p>
                  <p className="font-medium text-zinc-900 text-lg leading-snug">{infoModalVisitor.host_name}</p>
                </div>
              )}

              {infoModalVisitor.host_name && (
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Host Status</p>
                  {infoModalVisitor.host_confirmed ? (
                    <div className="flex items-center text-green-600 font-semibold text-base mt-1">
                      <ShieldCheck className="w-5 h-5 mr-1.5" /> 
                      Host confirmed arrival
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600 font-medium text-base mt-1">
                      <Clock className="w-5 h-5 mr-1.5" /> 
                      Pending host confirmation
                    </div>
                  )}
                </div>
              )}

              {infoModalVisitor.purpose && (
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Purpose of Visit</p>
                  <p className="font-medium text-zinc-900 text-lg leading-snug">{infoModalVisitor.purpose}</p>
                </div>
              )}
              {infoModalVisitor.vehicle_reg && (
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Vehicle Registration</p>
                  <p className="font-mono font-medium text-zinc-900 text-lg leading-snug">{infoModalVisitor.vehicle_reg}</p>
                </div>
              )}

              {infoModalVisitor.custom_data && Object.entries(infoModalVisitor.custom_data).map(([fieldId, value]) => {
                if (!value.trim()) return null; 
                const label = customFieldLabels[fieldId] || "Custom Field";
                return (
                  <div key={fieldId}>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="font-medium text-zinc-900 text-lg leading-snug">{value}</p>
                  </div>
                );
              })}
              
            </CardContent>
          </Card>
        </div>
      )}

      {enlargedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-[80] flex flex-col items-center justify-center p-4 cursor-pointer backdrop-blur-sm" 
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center">
            <button 
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
              onClick={(e) => { e.stopPropagation(); setEnlargedPhoto(null); }}
            >
              <X size={32} />
            </button>
            <Image 
              src={enlargedPhoto} 
              alt="Enlarged security photo" 
              width={1000}
              height={1000}
              className="w-full h-auto rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-zinc-800 object-contain max-h-[85vh]" 
              onClick={(e) => e.stopPropagation()} 
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}