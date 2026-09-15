"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { getAuthHeaders } from "@/lib/client-auth";
import {
  KeyRound,
  Mail,
  User,
  Loader2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  AlertTriangle,
  Building2,
  Upload,
  Compass,
  Code2,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Layers,
  RefreshCw,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { compressLogoImage, getCompanyLogoStoragePath } from "@/lib/company-logo";
import { useAppTour } from "@/hooks/useAppTour";

const ANONYMISE_VISITORS_ENDPOINT = "/api/company-admin/visitors/anonymise-checked-out";
const TERMINOLOGY_ENDPOINT = "/api/company-admin/terminology";
const API_KEYS_ENDPOINT = "/api/company-admin/api-keys";

type SettingsTab = "account" | "branding" | "terminology" | "api" | "privacy";

type ApiKeyRecord = {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
};

const SETTINGS_TABS: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "account", label: "Account & Profile", icon: User },
  { id: "branding", label: "Branding & Logo", icon: Building2 },
  { id: "terminology", label: "Facility Terminology", icon: SlidersHorizontal },
  { id: "api", label: "API & PMS Sync", icon: Code2 },
  { id: "privacy", label: "Data Privacy", icon: AlertTriangle },
];

const INDUSTRY_PRESETS = [
  { name: "Corporate Office", group: "Department", user: "Host" },
  { name: "Residential Estate / Apartments", group: "House / Unit", user: "Tenant" },
  { name: "Commercial / Business Park", group: "Suite / Office", user: "Occupant" },
  { name: "School / University", group: "Classroom / Department", user: "Teacher / Staff" },
  { name: "Coworking Space", group: "Dedicated Desk / Office", user: "Member" },
  { name: "Hospital / Healthcare", group: "Ward / Clinic", user: "Doctor / Patient" },
];

export default function SettingsPage() {
  const tour = useAppTour();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Account State
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Terminology State
  const [groupLabel, setGroupLabel] = useState("Department");
  const [userLabel, setUserLabel] = useState("Host");
  const [loadingTerminology, setLoadingTerminology] = useState(false);
  const [savingTerminology, setSavingTerminology] = useState(false);
  const [terminologyMessage, setTerminologyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newRawKey, setNewRawKey] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  // Data Privacy State
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);
  const [loadingEligibleCount, setLoadingEligibleCount] = useState(true);
  const [anonymiseConfirmation, setAnonymiseConfirmation] = useState("");
  const [anonymisingVisitors, setAnonymisingVisitors] = useState(false);

  // Synchronize Tab with URL Hash on Mount and Hash Change
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "") as SettingsTab;
      if (["account", "branding", "terminology", "api", "privacy"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${tab}`);
  };

  // Fetch Current Profile and Company
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setUserEmail(authData.user.email || "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id, full_name")
          .eq("id", authData.user.id)
          .single();

        if (profile) {
          setUserName(profile.full_name || "");
          if (profile.company_id) {
            setCompanyId(profile.company_id);
            const { data: company } = await supabase
              .from("companies")
              .select("name, logo_url, group_label, user_label")
              .eq("id", profile.company_id)
              .single();

            if (company) {
              setCompanyName(company.name || "");
              setCompanyLogoUrl(company.logo_url || null);
              if (company.group_label) setGroupLabel(company.group_label);
              if (company.user_label) setUserLabel(company.user_label);
            }
          }
        }
      }
    };
    fetchProfile();
  }, []);

  // Fetch API Keys
  const fetchApiKeys = useCallback(async () => {
    if (!companyId) return;
    setLoadingKeys(true);
    setKeysError(null);
    try {
      const res = await fetch(`${API_KEYS_ENDPOINT}?company_id=${companyId}`, {
        headers: await getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load API keys.");
      setApiKeys(json.data || []);
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Failed to load API keys.");
    } finally {
      setLoadingKeys(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (activeTab === "api" && companyId) {
      fetchApiKeys();
    }
  }, [activeTab, companyId, fetchApiKeys]);

  // Fetch Terminology
  const fetchTerminology = useCallback(async () => {
    if (!companyId) return;
    setLoadingTerminology(true);
    try {
      const res = await fetch(`${TERMINOLOGY_ENDPOINT}?company_id=${companyId}`, {
        headers: await getAuthHeaders(),
      });
      const json = await res.json();
      if (res.ok) {
        if (json.group_label) setGroupLabel(json.group_label);
        if (json.user_label) setUserLabel(json.user_label);
      }
    } catch {
      // ignore, fall back to initial
    } finally {
      setLoadingTerminology(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (activeTab === "terminology" && companyId) {
      fetchTerminology();
    }
  }, [activeTab, companyId, fetchTerminology]);

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!companyId) {
      setLogoUploadError("Workspace organization ID could not be loaded. Please refresh the page.");
      return;
    }

    setLogoUploadError(null);
    setUploadingLogo(true);
    setMessage(null);

    try {
      const compressed = await compressLogoImage(file);
      const storagePath = getCompanyLogoStoragePath(companyId, compressed.ext);

      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(storagePath, compressed.file, {
          contentType: compressed.contentType,
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload logo to storage bucket.");
      }

      const { data: publicUrlData } = supabase.storage
        .from("company-assets")
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("companies")
        .update({ logo_url: publicUrl })
        .eq("id", companyId);

      if (updateError) {
        throw new Error(updateError.message || "Failed to save logo URL to company profile.");
      }

      setCompanyLogoUrl(`${publicUrl}?t=${Date.now()}`);
      setMessage({ type: "success", text: "Organization logo updated successfully!" });
    } catch (err) {
      console.error("Error uploading company logo:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to upload company logo.";
      setLogoUploadError(errorMsg);
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  // Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!isStrongPassword(newPassword)) return setMessage({ type: "error", text: PASSWORD_REQUIREMENTS_MESSAGE });
    if (newPassword !== confirmPassword) return setMessage({ type: "error", text: "New passwords do not match." });

    setLoadingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoadingPass(false);
  };

  // Terminology Save
  const handleSaveTerminology = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSavingTerminology(true);
    setTerminologyMessage(null);

    try {
      const res = await fetch(TERMINOLOGY_ENDPOINT, {
        method: "PUT",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          company_id: companyId,
          group_label: groupLabel.trim() || "Department",
          user_label: userLabel.trim() || "Host",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update terminology.");

      setGroupLabel(json.group_label);
      setUserLabel(json.user_label);
      setTerminologyMessage({
        type: "success",
        text: `Facility terminology saved! Public check-in forms and departments now show "${json.group_label}" and "${json.user_label}".`,
      });
    } catch (err) {
      setTerminologyMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to update terminology.",
      });
    } finally {
      setSavingTerminology(false);
    }
  };

  // Create API Key
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !newKeyName.trim()) return;
    setCreatingKey(true);
    setKeysError(null);

    try {
      const res = await fetch(API_KEYS_ENDPOINT, {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          company_id: companyId,
          name: newKeyName.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate API key.");

      setNewRawKey(json.data.raw_key);
      setNewKeyName("");
      await fetchApiKeys();
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Failed to generate API key.");
    } finally {
      setCreatingKey(false);
    }
  };

  // Revoke API Key
  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? Any external PMS  scripts using it will be blocked immediately.")) return;
    setRevokingKeyId(keyId);
    setKeysError(null);

    try {
      const res = await fetch(`${API_KEYS_ENDPOINT}?id=${keyId}`, {
        method: "DELETE",
        headers: await getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to revoke API key.");
      await fetchApiKeys();
    } catch (err) {
      setKeysError(err instanceof Error ? err.message : "Failed to revoke API key.");
    } finally {
      setRevokingKeyId(null);
    }
  };

  // Copy API Key
  const handleCopyRawKey = () => {
    if (!newRawKey) return;
    navigator.clipboard.writeText(newRawKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // Visitor Anonymisation
  const fetchEligibleCount = useCallback(async () => {
    setLoadingEligibleCount(true);
    try {
      const response = await fetch(ANONYMISE_VISITORS_ENDPOINT, {
        cache: "no-store",
        headers: await getAuthHeaders(),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Checked-out visitors could not be counted.");
      setEligibleCount(Number(payload.eligibleCount || 0));
    } catch (error) {
      setEligibleCount(null);
    } finally {
      setLoadingEligibleCount(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "privacy") {
      fetchEligibleCount();
    }
  }, [activeTab, fetchEligibleCount]);

  const handleAnonymiseVisitors = async () => {
    setMessage(null);
    setAnonymisingVisitors(true);

    try {
      const response = await fetch(ANONYMISE_VISITORS_ENDPOINT, {
        method: "POST",
        headers: await getAuthHeaders(true),
        body: JSON.stringify({ confirmation: anonymiseConfirmation }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Checked-out visitors could not be anonymised.");
      }

      setMessage({
        type: "success",
        text: `${payload.anonymisedCount || 0} checked-out visitor${payload.anonymisedCount === 1 ? "" : "s"} anonymised successfully.`,
      });
      setAnonymiseConfirmation("");
      await fetchEligibleCount();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Checked-out visitors could not be anonymised.",
      });
    } finally {
      setAnonymisingVisitors(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <PageContainer className="max-w-6xl space-y-6">
      {/* Page Header */}
      <div id="tour-settings-header">
        <PageHeader
          title="Settings"
          description="Manage administrator profile, branding, building terminology, API sync keys, and privacy compliance."
          icon={SlidersHorizontal}
        >
          <Button
            type="button"
            variant="outline"
            onClick={tour.startSettingsTour}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl h-11 px-4"
          >
            Page Tour
          </Button>
        </PageHeader>
      </div>

      {/* Global Alerts */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-start gap-3 shadow-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
              : "bg-red-50 text-red-800 border-red-100"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{message.type === "success" ? "Success" : "Action Failed"}</p>
            <p className="mt-0.5">{message.text}</p>
          </div>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div
        id="tour-settings-tabs"
        className="flex items-center gap-1.5 overflow-x-auto rounded-[1.2rem] border border-slate-100 bg-white p-1.5 shadow-sm scrollbar-none"
      >
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                isSelected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`h-4 w-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Account & Profile */}
      {activeTab === "account" && (
        <div id="tour-settings-account" className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-6">
            <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] border border-blue-100 bg-blue-50 text-2xl font-black text-blue-600 shadow-sm">
                  {userName ? getInitials(userName) : <User className="w-8 h-8 text-slate-400" />}
                </div>

                <div className="mt-4">
                  <p className="text-xl font-black text-slate-900">{userName || "Administrator"}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                    {companyName ? `${companyName} • Admin` : "Workspace Admin"}
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{userName || "Not specified"}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{userEmail || "Loading..."}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Organization</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{companyName || "Personal Workspace"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-7 space-y-6">
            <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="flex items-center text-lg font-black text-slate-900">
                  <KeyRound className="mr-2 h-5 w-5 text-blue-600" /> Password & Security
                </CardTitle>
                <CardDescription>Update your administrator credentials with a secure password.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <Label htmlFor="account-new-password" className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      New Password
                    </Label>
                    <PasswordInput
                      id="account-new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-colors border-slate-200 rounded-xl"
                      placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="account-confirm-password" className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                      Confirm New Password
                    </Label>
                    <PasswordInput
                      id="account-confirm-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-colors border-slate-200 rounded-xl"
                      placeholder="Type password again"
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loadingPass || !newPassword || !confirmPassword}
                      className="h-11 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl"
                    >
                      {loadingPass ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating Password...</>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Branding & Logo */}
      {activeTab === "branding" && (
        <div id="tour-settings-branding" className="space-y-6 max-w-3xl">
          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg font-black text-slate-900">
                <Building2 className="mr-2 h-5 w-5 text-blue-600" /> Organization Branding & Logo
              </CardTitle>
              <CardDescription>
                Personalize visitor check-in gates, checkout pages, and digital passes with your logo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden p-2">
                  {companyLogoUrl ? (
                    <Image
                      src={companyLogoUrl}
                      alt={`${companyName || "Organization"} logo`}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Building2 className="h-8 w-8" />
                      <span className="text-[10px] font-bold mt-1">Default Logo</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-center sm:text-left">
                  <p className="text-sm font-bold text-slate-900">
                    {companyLogoUrl ? "Custom Logo Active" : "No Custom Logo Uploaded"}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                    {companyLogoUrl
                      ? "Your custom logo is active across visitor self check-in pages and admin/guard headers."
                      : "Karibu VMS default branding is currently shown. Upload your company or estate logo to personalize your gates."}
                  </p>
                </div>
              </div>

              {logoUploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-medium text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{logoUploadError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                <label
                  htmlFor="logo-file-input"
                  className={`inline-flex items-center justify-center h-11 px-6 rounded-xl font-bold text-sm shadow-sm cursor-pointer transition-colors ${
                    uploadingLogo
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading Logo...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {companyLogoUrl ? "Change Logo" : "Upload Logo"}
                    </>
                  )}
                  <input
                    id="logo-file-input"
                    type="file"
                    disabled={uploadingLogo}
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="sr-only"
                    onChange={handleLogoUpload}
                  />
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  PNG, JPEG, SVG, or WebP under 2MB
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: Industry Terminology */}
      {activeTab === "terminology" && (
        <div id="tour-settings-terminology" className="space-y-6 max-w-3xl">
          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center text-lg font-black text-slate-900">
                <SlidersHorizontal className="mr-2 h-5 w-5 text-blue-600" /> Facility & Industry Terminology
              </CardTitle>
              <CardDescription>
                Customize labels across the visitor check-in form and department directory to match your building type.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {terminologyMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                    terminologyMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {terminologyMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  )}
                  <span>{terminologyMessage.text}</span>
                </div>
              )}

              {/* Presets */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Quick Industry Presets
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {INDUSTRY_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setGroupLabel(preset.group);
                        setUserLabel(preset.user);
                      }}
                      className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 text-left transition-colors"
                    >
                      <p className="text-xs font-bold text-slate-900">{preset.name}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {preset.group} &bull; {preset.user}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveTerminology} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="terminology-group" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Group / Location Label
                    </Label>
                    <Input
                      id="terminology-group"
                      value={groupLabel}
                      onChange={(e) => setGroupLabel(e.target.value)}
                      placeholder="e.g. Department, House / Unit, Suite, Classroom"
                      className="h-11 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                    />
                    <p className="text-[11px] text-slate-500">
                      Replaces &ldquo;Department&rdquo; across visitor dropdowns and directory headers.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="terminology-user" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Host / Person Label
                    </Label>
                    <Input
                      id="terminology-user"
                      value={userLabel}
                      onChange={(e) => setUserLabel(e.target.value)}
                      placeholder="e.g. Host, Tenant, Member, Teacher"
                      className="h-11 rounded-xl bg-slate-50 border-slate-200 font-semibold"
                    />
                    <p className="text-[11px] text-slate-500">
                      Replaces &ldquo;Host&rdquo; on visitor entry forms and notification cards.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={savingTerminology || loadingTerminology}
                    className="h-11 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                  >
                    {savingTerminology ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                      "Save Terminology"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: API & PMS Sync */}
      {activeTab === "api" && (
        <div id="tour-settings-api" className="space-y-6 max-w-4xl">
          <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center text-lg font-black text-slate-900">
                    <Code2 className="mr-2 h-5 w-5 text-blue-600" /> Directory Sync REST API & Keys
                  </CardTitle>
                  <CardDescription>
                    Synchronize units, departments, hosts, or tenants automatically from external PMS software.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setShowNewKeyModal(true);
                    setNewRawKey(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-4 shrink-0 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Generate API Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {keysError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>{keysError}</span>
                </div>
              )}

              {/* Active Keys List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Active API Keys ({apiKeys.length})
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchApiKeys}
                    disabled={loadingKeys}
                    className="h-8 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loadingKeys ? "animate-spin" : ""}`} /> Refresh
                  </Button>
                </div>

                {loadingKeys ? (
                  <div className="p-8 text-center text-xs font-bold text-slate-400">Loading API keys...</div>
                ) : apiKeys.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                    <Code2 className="h-8 w-8 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700 mt-2">No API keys created yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Generate an API key to allow your Property Management System to sync departments and hosts.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white overflow-hidden">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{key.name}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </div>
                          <p className="font-mono text-xs text-slate-500">
                            Prefix: <span className="font-semibold text-slate-700">{key.key_prefix}...</span>
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Created: {new Date(key.created_at).toLocaleDateString()} &bull; Last used:{" "}
                            {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : "Never"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={revokingKeyId === key.id}
                          onClick={() => handleRevokeApiKey(key.id)}
                          className="h-9 px-3 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 shrink-0"
                        >
                          {revokingKeyId === key.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><Trash2 className="h-3.5 w-3.5 mr-1" /> Revoke</>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* API Documentation Quick Reference */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Integration Endpoints Reference
                  </p>
                </div>
                <div className="space-y-2 text-xs text-slate-600">
                  <p>
                    Pass your API key as a Bearer token in the <code className="px-1.5 py-0.5 rounded bg-white border border-blue-200 font-mono text-[11px]">Authorization: Bearer &lt;key&gt;</code> header.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                      <span className="font-bold text-emerald-700">POST</span> /api/v1/sync/groups
                      <p className="text-[10px] font-sans text-slate-500 mt-1">Batch sync departments, buildings, or house numbers.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-blue-100">
                      <span className="font-bold text-emerald-700">POST</span> /api/v1/sync/users
                      <p className="text-[10px] font-sans text-slate-500 mt-1">Batch sync hosts, tenants, or faculty members.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: Data Privacy & Compliance */}
      {activeTab === "privacy" && (
        <div id="tour-settings-privacy" className="space-y-6 max-w-3xl">
          <Card className="rounded-[1.4rem] border-red-100 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-red-100 pb-4 bg-red-50/30">
              <CardTitle className="flex items-center text-lg font-black text-red-900">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Data Privacy & Compliance (GDPR)
              </CardTitle>
              <CardDescription className="text-red-700/80">
                Permanently anonymise personal details from visitors who have already departed.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-bold text-red-900">
                  {loadingEligibleCount
                    ? "Counting checked-out visitors..."
                    : `${eligibleCount ?? 0} checked-out visitor${eligibleCount === 1 ? "" : "s"} available to anonymise`}
                </p>
                <p className="mt-1 text-xs text-red-800 leading-relaxed">
                  This scrubs visitor names, phone numbers, ID documents, and photos while leaving billing records, transaction statements, and audit logs intact.
                </p>
              </div>

              <div className="space-y-2 max-w-md">
                <Label htmlFor="anonymise-confirmation" className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                  Type ANONYMISE to confirm
                </Label>
                <Input
                  id="anonymise-confirmation"
                  value={anonymiseConfirmation}
                  onChange={(event) => setAnonymiseConfirmation(event.target.value)}
                  className="h-11 border-red-100 bg-red-50 focus:bg-white focus:ring-2 focus:ring-red-500 rounded-xl font-mono text-sm"
                  placeholder="ANONYMISE"
                  autoComplete="off"
                />
              </div>

              <Button
                type="button"
                disabled={
                  anonymisingVisitors ||
                  loadingEligibleCount ||
                  anonymiseConfirmation !== "ANONYMISE" ||
                  !eligibleCount
                }
                onClick={handleAnonymiseVisitors}
                className="w-full sm:w-auto h-11 px-6 bg-red-600 text-sm font-bold text-white shadow-sm hover:bg-red-700 rounded-xl"
              >
                {anonymisingVisitors ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Anonymising...</>
                ) : (
                  "Anonymise Checked-Out Visitors"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Generate New API Key */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg rounded-[1.5rem] border-slate-100 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-blue-600" />
                  {newRawKey ? "API Key Generated" : "Generate Directory Sync API Key"}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewKeyModal(false)}
                  className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {newRawKey
                  ? "Make sure to copy your API key now. You will not be able to see it again."
                  : "Create a credential for your Property Management System (PMS)  sync."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {newRawKey ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>Copy this key immediately. For security, it will never be displayed in plaintext again.</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your API Secret Key</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={newRawKey}
                        className="h-11 font-mono text-xs bg-slate-50 border-slate-200 rounded-xl"
                      />
                      <Button
                        type="button"
                        onClick={handleCopyRawKey}
                        className={`h-11 px-4 font-bold rounded-xl shrink-0 ${
                          copiedKey ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                      >
                        {copiedKey ? <CheckCircle2 className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
                        {copiedKey ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      onClick={() => setShowNewKeyModal(false)}
                      className="h-11 px-6 font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateApiKey} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-key-name" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Key Name / Integration Identifier
                    </Label>
                    <Input
                      id="new-key-name"
                      required
                      placeholder="e.g. Yardi PMS Production, Estate Directory Sync"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="h-11 rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowNewKeyModal(false)}
                      className="h-11 px-4 font-bold text-slate-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creatingKey || !newKeyName.trim()}
                      className="h-11 px-6 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
                    >
                      {creatingKey ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                      ) : (
                        "Generate Key"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
