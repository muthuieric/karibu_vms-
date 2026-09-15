"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  KeyRound,
  LogOut,
  Plus,
  QrCode,
  Search,
  Share2,
  Trash2,
  User,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalShell } from "@/components/dashboard/shared/ModalShell";
import { getAuthHeaders } from "@/lib/client-auth";
import { supabase } from "@/lib/supabase";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";

type HostSummary = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  department_id?: string;
};

type HostProfile = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company_id: string;
  department_id: string;
};

type CompanyInfo = {
  id: string;
  name: string;
  logo_url?: string | null;
};

type HostVisitor = {
  id: string;
  company_id: string;
  name: string;
  status: "pre_registered" | "pending" | "checked_in" | "checked_out" | "auto_checked_out" | "cancelled";
  expected_arrival?: string | null;
  is_pre_registered?: boolean;
  pre_registered_by?: string | null;
  host_id?: string | null;
  host_name?: string | null;
  purpose?: string | null;
  phone_last4?: string | null;
  pass_token?: string | null;
  pass_code?: string | null;
  passUrl?: string | null;
  created_at?: string;
  checked_in_at?: string;
  checked_out_at?: string;
};

function formatDateTime(isoString?: string | null) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " at " + d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function getDefaultArrivalDateTime() {
  const d = new Date();
  d.setHours(d.getHours() + 2);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function HostPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlHostId = searchParams.get("hostId") || searchParams.get("host_id");

  const [selectedHostId, setSelectedHostId] = useState<string | null>(urlHostId);
  const [host, setHost] = useState<HostProfile | null>(null);
  const [allHosts, setAllHosts] = useState<HostSummary[]>([]);
  const [isAdminPreview, setIsAdminPreview] = useState(false);
  const [noHostsFound, setNoHostsFound] = useState(false);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [visitors, setVisitors] = useState<HostVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Force password change on first login state
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pre_registered" | "checked_in" | "cancelled">("all");

  // Pre-Register Modal state
  const [isPreRegisterModalOpen, setIsPreRegisterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"direct" | "share">("direct");
  const [directName, setDirectName] = useState("");
  const [directPhone, setDirectPhone] = useState("");
  const [directPurpose, setDirectPurpose] = useState("");
  const [directArrival, setDirectArrival] = useState(getDefaultArrivalDateTime());
  const [submittingDirect, setSubmittingDirect] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);

  // Share QR code state
  const [shareQrDataUrl, setShareQrDataUrl] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Pass View Modal state
  const [viewingPassVisitor, setViewingPassVisitor] = useState<HostVisitor | null>(null);
  const [passQrDataUrl, setPassQrDataUrl] = useState<string | null>(null);
  const [passLinkCopied, setPassLinkCopied] = useState(false);

  // Revoke confirmation modal
  const [revokingVisitor, setRevokingVisitor] = useState<HostVisitor | null>(null);
  const [revokingActionLoading, setRevokingActionLoading] = useState(false);

  // Check if current user must change password
  useEffect(() => {
    const checkPasswordRequirement = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const mustChange = authData.user.user_metadata?.must_change_password === true;
          if (mustChange) {
            setMustChangePassword(true);
          }
        }
      } catch (err) {
        console.error("Error checking password flag:", err);
      }
    };
    checkPasswordRequirement();
  }, []);

  // Load host portal data
  const loadHostData = async (targetHostId?: string | null) => {
    try {
      setLoading(true);
      setError(null);
      setNoHostsFound(false);
      const headers = await getAuthHeaders();
      const idToFetch = targetHostId !== undefined ? targetHostId : (selectedHostId || urlHostId);
      const query = idToFetch ? `?host_id=${encodeURIComponent(idToFetch)}` : "";
      const res = await fetch(`/api/host/visitors${query}`, { headers });
      const json = await res.json();

      if (!res.ok) {
        if (json.noHosts) {
          setNoHostsFound(true);
        }
        throw new Error(json.error || "Failed to load host dashboard");
      }

      setHost(json.data?.host || null);
      setCompany(json.data?.company || null);
      setVisitors(json.data?.visitors || []);
      setAllHosts(json.data?.allHosts || []);
      setIsAdminPreview(!!json.data?.isAdminPreview);
      if (json.data?.host?.id) {
        setSelectedHostId(json.data.host.id);
      }
    } catch (err) {
      console.error("Host portal data load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load host information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostData(urlHostId);
  }, [urlHostId]);

  const handleSwitchHost = (newId: string) => {
    setSelectedHostId(newId);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("hostId", newId);
    router.replace(newUrl.pathname + newUrl.search);
    loadHostData(newId);
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!isStrongPassword(newPassword)) {
      setPasswordError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: { must_change_password: false },
      });

      if (updateError) throw updateError;

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        await supabase
          .from("profiles")
          .update({ must_change_password: false })
          .eq("id", authData.user.id);
      }

      setPasswordSuccess(true);
      setTimeout(() => {
        setMustChangePassword(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  // Compute shareable invite link for host
  const shareableUrl = useMemo(() => {
    if (!company?.id || !host?.id || typeof window === "undefined") return "";
    return `${window.location.origin}/${company.id}/pre-register?hostId=${host.id}`;
  }, [company?.id, host?.id]);

  // Generate QR Code for shareable link
  useEffect(() => {
    if (!shareableUrl) return;
    let active = true;
    QRCode.toDataURL(shareableUrl, {
      margin: 1,
      width: 280,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then((dataUrl) => {
      if (active) setShareQrDataUrl(dataUrl);
    }).catch(() => {
      if (active) setShareQrDataUrl(null);
    });
    return () => {
      active = false;
    };
  }, [shareableUrl]);

  // Generate QR code for individual visitor pass modal
  useEffect(() => {
    if (!viewingPassVisitor?.passUrl) {
      setPassQrDataUrl(null);
      return;
    }
    let active = true;
    QRCode.toDataURL(viewingPassVisitor.passUrl, {
      margin: 1,
      width: 260,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then((url) => {
      if (active) setPassQrDataUrl(url);
    }).catch(() => {
      if (active) setPassQrDataUrl(null);
    });
    return () => {
      active = false;
    };
  }, [viewingPassVisitor?.passUrl]);

  // Direct pre-registration submission
  const handleDirectPreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminPreview) {
      setDirectError("Administrators cannot pre-register visitors on behalf of hosts.");
      return;
    }
    if (!directName.trim() || !directArrival) {
      setDirectError("Visitor name and expected arrival time are required.");
      return;
    }

    try {
      setSubmittingDirect(true);
      setDirectError(null);
      const headers = await getAuthHeaders(true);
      const res = await fetch("/api/host/visitors", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: directName.trim(),
          phone: directPhone.trim() || null,
          purpose: directPurpose.trim() || null,
          expected_arrival: directArrival,
          host_id: host?.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to pre-register visitor.");
      }

      const created = json.data as HostVisitor;
      setVisitors((prev) => [created, ...prev]);

      // Reset form & open pass modal
      setDirectName("");
      setDirectPhone("");
      setDirectPurpose("");
      setDirectArrival(getDefaultArrivalDateTime());
      setIsPreRegisterModalOpen(false);
      setViewingPassVisitor(created);
    } catch (err) {
      setDirectError(err instanceof Error ? err.message : "Failed to pre-register visitor.");
    } finally {
      setSubmittingDirect(false);
    }
  };

  // Revoke / Cancel or Delete visitor
  const handleRevokeAction = async (action: "cancel" | "delete") => {
    if (!revokingVisitor || isAdminPreview) return;

    try {
      setRevokingActionLoading(true);
      const headers = await getAuthHeaders(true);
      const res = await fetch("/api/host/visitors", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          visitor_id: revokingVisitor.id,
          action,
          host_id: host?.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Action failed.");
      }

      if (action === "delete") {
        setVisitors((prev) => prev.filter((v) => v.id !== revokingVisitor.id));
      } else {
        setVisitors((prev) =>
          prev.map((v) => (v.id === revokingVisitor.id ? { ...v, status: "cancelled" } : v))
        );
      }

      setRevokingVisitor(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update visitor.");
    } finally {
      setRevokingActionLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    if (!shareableUrl) return;
    navigator.clipboard.writeText(shareableUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleCopyPassLink = () => {
    if (!viewingPassVisitor?.passUrl) return;
    navigator.clipboard.writeText(viewingPassVisitor.passUrl);
    setPassLinkCopied(true);
    setTimeout(() => setPassLinkCopied(false), 2500);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // Metrics
  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    let preRegisteredCount = 0;
    let expectedTodayCount = 0;

    visitors.forEach((v) => {
      if (v.status === "pre_registered") {
        preRegisteredCount++;
        if (v.expected_arrival) {
          const arrivalDate = new Date(v.expected_arrival).toDateString();
          if (arrivalDate === today) expectedTodayCount++;
        }
      }
    });

    return {
      preRegisteredCount,
      expectedTodayCount,
      totalHosted: visitors.length,
    };
  }, [visitors]);

  // Filtered visitors
  const filteredVisitors = useMemo(() => {
    return visitors.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        (v.phone_last4 && v.phone_last4.includes(q)) ||
        (v.purpose && v.purpose.toLowerCase().includes(q))
      );
    });
  }, [visitors, statusFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {company?.logo_url ? (
              <Image
                src={company.logo_url}
                alt={`${company.name} logo`}
                width={120}
                height={36}
                unoptimized
                className="h-9 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-base font-bold text-white shadow-sm">
                {(company?.name || "K").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden border-l border-slate-200 pl-3 sm:block">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Host Portal</p>
              <p className="text-sm font-extrabold text-slate-900">{company?.name || "Karibu VMS"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-bold text-slate-900">{host?.name || "Host"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="border-slate-200 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Admin Preview Banner */}
      {isAdminPreview && (
        <div className="border-b border-amber-300 bg-amber-400/90 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-inner">
          <div className="mx-auto flex max-w-6xl items-center justify-between flex-wrap gap-2 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-600/30 px-2 py-0.5 uppercase tracking-wider text-[10px] font-black text-amber-950">
                Admin Preview • Read-Only
              </span>
              <span>Previewing Host Portal as administrator. For security and tenant privacy, administrators cannot add, edit, or delete visits on behalf of hosts.</span>
            </div>
            <div className="flex items-center gap-2.5">
              {allHosts.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-900">Switch Host:</span>
                  <select
                    value={host?.id || ""}
                    onChange={(e) => handleSwitchHost(e.target.value)}
                    className="rounded-lg border border-amber-600/50 bg-white px-2 py-1 text-xs font-bold text-slate-900 shadow-sm focus:outline-none"
                  >
                    {allHosts.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.email ? `(${h.email})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Link
                href="/dashboard/company-admin"
                className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Return to Admin
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Error notice */}
        {error && !noHostsFound && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* No Hosts Found Notice */}
        {noHostsFound ? (
          <div className="my-12 mx-auto max-w-lg text-center bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <UserX className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h2 className="text-xl font-black text-slate-900">No Hosts in Organization</h2>
            <p className="mt-2 text-sm text-slate-600">
              No hosts have been created for your company yet. To use the Host Portal, please add a host in the admin dashboard.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/dashboard/company-admin/departments">
                <Button className="bg-blue-600 text-white font-bold rounded-xl">Add Hosts in Departments</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
        {/* Hero / Action bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Host Dashboard</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Pre-register visitors, share direct invite links, and manage your scheduled arrivals.
            </p>
          </div>

          {!isAdminPreview ? (
            <div className="flex items-center gap-2.5">
              <Button
                onClick={() => {
                  setActiveTab("share");
                  setIsPreRegisterModalOpen(true);
                }}
                variant="outline"
                className="border-slate-200 bg-white font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Share2 className="mr-2 h-4 w-4 text-blue-600" />
                Invite Link
              </Button>
              <Button
                onClick={() => {
                  setActiveTab("direct");
                  setIsPreRegisterModalOpen(true);
                }}
                className="bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Pre-Register Visitor
              </Button>
            </div>
          ) : (
            <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
              Read-Only Admin View
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Pre-Registered</p>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                <CalendarClock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{metrics.preRegisteredCount}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Awaiting arrival at gate</p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Expected Today</p>
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{metrics.expectedTodayCount}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Scheduled for today</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Visits</p>
              <div className="rounded-xl bg-slate-50 p-2 text-slate-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">{metrics.totalHosted}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">All registered guests</p>
          </div>
        </div>

        {/* Visitor Queue Controls */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search visitor name, phone, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-10 text-sm"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  statusFilter === "all" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("pre_registered")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  statusFilter === "pre_registered" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pre-Registered
              </button>
              <button
                onClick={() => setStatusFilter("checked_in")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  statusFilter === "checked_in" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Checked In
              </button>
              <button
                onClick={() => setStatusFilter("cancelled")}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  statusFilter === "cancelled" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Visitors Table / List */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-sm font-semibold text-slate-500">
              Loading visitors...
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <CalendarClock className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-base font-bold text-slate-900">No visitors found</p>
              <p className="mt-1 text-sm text-slate-500">
                {searchTerm || statusFilter !== "all"
                  ? "Try changing your search query or filter."
                  : "You haven't scheduled any visitors yet. Pre-register your first guest now!"}
              </p>
              {!isAdminPreview && (
                <Button
                  onClick={() => {
                    setActiveTab("direct");
                    setIsPreRegisterModalOpen(true);
                  }}
                  className="mt-4 bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Pre-Register Visitor
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5">Visitor</th>
                    <th className="px-5 py-3.5">Expected Arrival</th>
                    <th className="px-5 py-3.5">Purpose</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVisitors.map((visitor) => {
                    const isPreReg = visitor.status === "pre_registered";
                    const isCancelled = visitor.status === "cancelled";
                    const isCheckedIn = visitor.status === "checked_in";

                    return (
                      <tr key={visitor.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-slate-900">{visitor.name}</p>
                          <p className="text-xs text-slate-500">
                            {visitor.phone_last4 ? `••••${visitor.phone_last4}` : "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800">{formatDateTime(visitor.expected_arrival)}</p>
                          {visitor.expected_arrival && (
                            <p className="text-xs text-slate-500">
                              Registered {new Date(visitor.created_at || "").toLocaleDateString()}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-slate-700 font-medium">
                            {visitor.purpose || <span className="text-slate-400 italic">Not specified</span>}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {isPreReg && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700">
                              <Clock className="h-3 w-3" />
                              Pre-Registered
                            </span>
                          )}
                          {isCheckedIn && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-extrabold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Checked In
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-extrabold text-rose-700">
                              <XCircle className="h-3 w-3" />
                              Cancelled
                            </span>
                          )}
                          {!isPreReg && !isCheckedIn && !isCancelled && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                              {visitor.status}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {visitor.pass_token && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingPassVisitor(visitor)}
                                className="h-8 border-slate-200 text-xs font-bold text-blue-700 hover:bg-blue-50"
                              >
                                <QrCode className="mr-1.5 h-3.5 w-3.5" />
                                Pass / QR
                              </Button>
                            )}

                            {!isAdminPreview && isPreReg && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRevokingVisitor(visitor)}
                                className="h-8 border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50"
                              >
                                <UserX className="mr-1.5 h-3.5 w-3.5" />
                                Revoke
                              </Button>
                            )}

                            {!isAdminPreview && isCancelled && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setRevokingVisitor(visitor)}
                                className="h-8 text-xs font-bold text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
      )}
      </main>

      {/* Pre-Register Modal (Direct Register + Share Link & QR) */}
      {isPreRegisterModalOpen && (
        <ModalShell
          title="Pre-Register Visitor"
          description="Schedule an incoming guest or generate a shareable registration link."
          onClose={() => setIsPreRegisterModalOpen(false)}
          className="max-w-lg"
        >
          {/* Tabs */}
          <div className="mb-5 flex rounded-xl bg-slate-100 p-1 text-sm font-bold">
            <button
              onClick={() => setActiveTab("direct")}
              className={`flex-1 rounded-lg py-2 transition-all ${
                activeTab === "direct" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Direct Entry
            </button>
            <button
              onClick={() => setActiveTab("share")}
              className={`flex-1 rounded-lg py-2 transition-all ${
                activeTab === "share" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Share Link & QR
            </button>
          </div>

          {activeTab === "direct" ? (
            <form onSubmit={handleDirectPreRegister} className="space-y-4">
              {directError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                  {directError}
                </div>
              )}

              <div>
                <Label htmlFor="visitorName" className="text-xs font-bold text-slate-700">
                  Visitor Full Name *
                </Label>
                <Input
                  id="visitorName"
                  required
                  placeholder="e.g. John Doe"
                  value={directName}
                  onChange={(e) => setDirectName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="visitorPhone" className="text-xs font-bold text-slate-700">
                  Phone Number
                </Label>
                <Input
                  id="visitorPhone"
                  type="tel"
                  placeholder="e.g. +254 700 000 000"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="visitorArrival" className="text-xs font-bold text-slate-700">
                  Expected Arrival Date & Time *
                </Label>
                <Input
                  id="visitorArrival"
                  type="datetime-local"
                  required
                  value={directArrival}
                  onChange={(e) => setDirectArrival(e.target.value)}
                  className="mt-1 font-semibold"
                />
              </div>

              <div>
                <Label htmlFor="visitorPurpose" className="text-xs font-bold text-slate-700">
                  Purpose of Visit
                </Label>
                <Input
                  id="visitorPurpose"
                  placeholder="e.g. Interview, Project Discussion, Vendor Delivery"
                  value={directPurpose}
                  onChange={(e) => setDirectPurpose(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={submittingDirect}
                  className="w-full bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {submittingDirect ? "Pre-Registering..." : "Pre-Register & Generate Pass"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <p className="text-xs text-slate-600 leading-relaxed">
                Send this link or show this QR code to your visitor. They can complete their details online and receive their entry pass immediately.
              </p>

              {/* QR Code Container */}
              <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-3 shadow-inner">
                {shareQrDataUrl ? (
                  <Image
                    src={shareQrDataUrl}
                    alt="Pre-registration QR code"
                    width={220}
                    height={220}
                    unoptimized
                    className="rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="text-xs font-bold text-slate-400">Generating QR...</div>
                )}
              </div>

              {/* URL Box & Copy */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="break-all font-mono text-xs text-slate-700 select-all">{shareableUrl}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="flex-1 bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {linkCopied ? "Link Copied!" : "Copy Share Link"}
                </Button>

                {shareQrDataUrl && (
                  <a
                    href={shareQrDataUrl}
                    download={`pre-register-${host?.name || "host"}.png`}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <Download className="mr-1.5 h-4 w-4 text-slate-600" />
                    Save QR
                  </a>
                )}
              </div>
            </div>
          )}
        </ModalShell>
      )}

      {/* Visitor Pass Modal */}
      {viewingPassVisitor && (
        <ModalShell
          title="Visitor Pass"
          description={`Pass details for ${viewingPassVisitor.name}.`}
          onClose={() => setViewingPassVisitor(null)}
          className="max-w-sm"
        >
          <div className="space-y-4 text-center">
            {passQrDataUrl ? (
              <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <Image
                  src={passQrDataUrl}
                  alt="Pass QR"
                  width={200}
                  height={200}
                  unoptimized
                  className="rounded-xl"
                />
              </div>
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-400 mx-auto">
                Loading QR...
              </div>
            )}

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left space-y-2 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase">Guest Name</p>
                <p className="font-extrabold text-sm text-slate-900">{viewingPassVisitor.name}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 uppercase">Scheduled Arrival</p>
                <p className="font-extrabold text-slate-800">{formatDateTime(viewingPassVisitor.expected_arrival)}</p>
              </div>
              {viewingPassVisitor.purpose && (
                <div>
                  <p className="font-bold text-slate-400 uppercase">Purpose</p>
                  <p className="font-semibold text-slate-700">{viewingPassVisitor.purpose}</p>
                </div>
              )}
            </div>

            {viewingPassVisitor.passUrl && (
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleCopyPassLink}
                  className="w-full bg-blue-600 font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {passLinkCopied ? "Pass Link Copied!" : "Copy Pass Link"}
                </Button>

                <a
                  href={viewingPassVisitor.passUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  Open Full Pass
                </a>
              </div>
            )}
          </div>
        </ModalShell>
      )}

      {/* Revoke / Delete Confirmation Modal */}
      {revokingVisitor && (
        <ModalShell
          title="Revoke / Delete Visitor"
          description={`Choose what to do with the pre-registration for ${revokingVisitor.name}.`}
          onClose={() => setRevokingVisitor(null)}
          className="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Revoking marks this visitor as <strong className="text-slate-900">Cancelled</strong> in the queue, preventing entry while preserving audit history. You can also permanently delete the record.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2">
              <Button
                variant="outline"
                disabled={revokingActionLoading}
                onClick={() => handleRevokeAction("cancel")}
                className="border-rose-300 bg-rose-50 font-bold text-rose-700 hover:bg-rose-100"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Revoke Visit
              </Button>

              <Button
                variant="outline"
                disabled={revokingActionLoading}
                onClick={() => handleRevokeAction("delete")}
                className="border-slate-300 font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <Trash2 className="mr-2 h-4 w-4 text-slate-500" />
                Delete Record
              </Button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Force Change Password on First Login Modal */}
      {mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-2xl bg-amber-50 p-2.5 text-amber-600">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Set Your New Password</h2>
                <p className="text-xs text-slate-500">First-time login security requirement</p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-600">
              Your host account was created with a default password. For security, please set your own private password before accessing the Host Portal.
            </p>

            {passwordError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {passwordError}
              </div>
            )}

            {passwordSuccess ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-800">
                ✓ Password updated successfully! Loading your portal...
              </div>
            ) : (
              <form onSubmit={handleSaveNewPassword} className="mt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="host-new-password" className="text-xs font-bold text-slate-700">
                    New Password *
                  </Label>
                  <Input
                    id="host-new-password"
                    type="password"
                    required
                    placeholder="Enter at least 8 characters..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="rounded-xl border-slate-200"
                  />
                  <p className="text-[11px] text-slate-400">
                    Must be at least 8 characters with upper, lower, number, and special character.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="host-confirm-password" className="text-xs font-bold text-slate-700">
                    Confirm New Password *
                  </Label>
                  <Input
                    id="host-confirm-password"
                    type="password"
                    required
                    placeholder="Re-enter your new password..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl border-slate-200"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="w-full bg-blue-600 font-bold text-white hover:bg-blue-700 rounded-xl h-11"
                  >
                    {changingPassword ? "Updating Password..." : "Save Password & Continue"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HostPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <p className="text-sm font-bold text-slate-500">Loading Host Portal...</p>
        </div>
      }
    >
      <HostPortalContent />
    </Suspense>
  );
}

