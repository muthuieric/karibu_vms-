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
import { KeyRound, Mail, User, Loader2, CheckCircle2, AlertCircle, SlidersHorizontal, AlertTriangle, Building2, Upload } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { compressLogoImage, getCompanyLogoStoragePath } from "@/lib/company-logo";

const ANONYMISE_VISITORS_ENDPOINT = "/api/company-admin/visitors/anonymise-checked-out";

export default function AccountPage() {
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
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [eligibleCount, setEligibleCount] = useState<number | null>(null);
  const [loadingEligibleCount, setLoadingEligibleCount] = useState(true);
  const [anonymiseConfirmation, setAnonymiseConfirmation] = useState("");
  const [anonymisingVisitors, setAnonymisingVisitors] = useState(false);

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
              .select("name, logo_url")
              .eq("id", profile.company_id)
              .single();

            if (company) {
              setCompanyName(company.name || "");
              setCompanyLogoUrl(company.logo_url || null);
            }
          }
        }
      }
    };
    fetchProfile();
  }, []);

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
      // Reset the input value so the same file can be re-selected if desired
      e.target.value = "";
    }
  };

  const fetchEligibleCount = useCallback(async () => {
    await Promise.resolve();
    setLoadingEligibleCount(true);
    try {
      const response = await fetch(ANONYMISE_VISITORS_ENDPOINT, {
        cache: "no-store",
        headers: await getAuthHeaders(),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Checked-out visitors could not be counted.");
      }

      setEligibleCount(Number(payload.eligibleCount || 0));
    } catch (error) {
      setEligibleCount(null);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Checked-out visitors could not be counted.",
      });
    } finally {
      setLoadingEligibleCount(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchEligibleCount();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchEligibleCount]);

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

  // Helper to get initials for the avatar
  const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <PageContainer className="max-w-4xl">
        
        <PageHeader
          title="Account"
          description="Manage your profile details and security credentials."
          icon={SlidersHorizontal}
        />

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium border flex items-start gap-3 shadow-sm ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />}
            <div>
              <p className="font-bold">{message.type === 'success' ? 'Success' : 'Action Failed'}</p>
              <p className="mt-0.5">{message.text}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            <Card className="overflow-hidden rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
              <CardContent className="relative px-6 py-6">
                
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.25rem] border border-blue-100 bg-blue-50 text-2xl font-black text-blue-600 shadow-sm md:mx-0">
                  {userName ? getInitials(userName) : <User className="w-8 h-8 text-slate-400" />}
                </div>

                <div className="mt-4 text-center md:text-left">
                  <p className="text-xl font-bold text-slate-900">{userName || "Loading..."}</p>
                  <p className="text-sm font-bold text-slate-500 flex items-center justify-center md:justify-start gap-1.5 mt-1 uppercase tracking-wider">
                    {companyName ? `${companyName} • Admin` : "Workspace Admin"}
                  </p>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Full Name</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{userName || "—"}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Email Address</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{userEmail || "—"}</p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            {/* Organization Branding Card */}
            <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-bold text-slate-900">
                  <Building2 className="mr-2 h-5 w-5 text-blue-600" /> Organization Branding
                </CardTitle>
                <CardDescription>
                  Upload your organization logo to brand your public visitor check-in gate and dashboard headers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                    {companyLogoUrl ? (
                      <Image
                        src={companyLogoUrl}
                        alt={`${companyName || "Company"} logo`}
                        width={120}
                        height={60}
                        className="max-h-16 w-auto object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <Building2 className="h-7 w-7 mb-1 text-slate-300" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Default Icon</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      {companyLogoUrl ? "Custom Logo Active" : "No Custom Logo Uploaded"}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {companyLogoUrl
                        ? "Your custom logo is active across visitor self check-in pages and admin/guard headers."
                        : "Karibu VMS default branding is currently shown. Upload your company logo to personalize your gates."}
                    </p>
                  </div>
                </div>

                {logoUploadError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-medium text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{logoUploadError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label
                    htmlFor="logo-file-input"
                    className={`inline-flex items-center justify-center h-11 px-5 rounded-xl font-bold text-sm shadow-sm cursor-pointer transition-colors ${
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
                        {companyLogoUrl ? "Change Organization Logo" : "Upload Organization Logo"}
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

            <Card className="rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-bold">
                  <KeyRound className="mr-2 h-5 w-5 text-slate-400" /> Password & Security
                </CardTitle>
                <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
              </CardHeader>
              <CardContent className="max-w-md">
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="account-new-password" className="font-bold text-slate-700 text-xs uppercase tracking-wider">New Password</Label>
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
                    <Label htmlFor="account-confirm-password" className="font-bold text-slate-700 text-xs uppercase tracking-wider">Confirm New Password</Label>
                    <PasswordInput
                      id="account-confirm-password"
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="h-11 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-colors border-slate-200 rounded-xl" 
                      placeholder="Type password again"
                    />
                  </div>
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={loadingPass || !newPassword || !confirmPassword} 
                      className="w-full sm:w-auto h-11 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl"
                    >
                      {loadingPass ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[1.4rem] border-red-100 bg-white shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center text-xl font-bold text-red-900">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently remove personal details from visitors who have already checked out.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-bold text-red-900">
                    {loadingEligibleCount
                      ? "Counting checked-out visitors..."
                      : `${eligibleCount ?? 0} checked-out visitor${eligibleCount === 1 ? "" : "s"} available to anonymise`}
                  </p>
                  <p className="mt-1 text-sm text-red-800">
                    This clears visitor personal fields and photos while leaving billing, transactions, audit logs, red flags, companies, and profiles untouched.
                  </p>
                </div>

                <div className="max-w-md space-y-1.5">
                  <Label htmlFor="anonymise-confirmation" className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Type ANONYMISE to confirm
                  </Label>
                  <Input
                    id="anonymise-confirmation"
                    value={anonymiseConfirmation}
                    onChange={(event) => setAnonymiseConfirmation(event.target.value)}
                    className="h-11 border-red-100 bg-red-50 focus:bg-white focus:ring-2 focus:ring-red-500"
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
                  className="w-full bg-red-600 text-sm font-bold text-white shadow-sm hover:bg-red-700 sm:w-auto"
                >
                  {anonymisingVisitors ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Anonymising...</>
                  ) : (
                    "Anonymise checked-out visitors"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
    </PageContainer>
  );
}
