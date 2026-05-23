"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { KeyRound, Mail, User, Loader2, CheckCircle2, AlertCircle, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { PageContainer } from "@/components/dashboard/shared/AppShell";

export default function AccountPage() {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setUserEmail(authData.user.email || "");
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", authData.user.id)
          .single();
          
        if (profile) {
          setUserName(profile.full_name || "");
        }
      }
    };
    fetchProfile();
  }, []);

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
                    Workspace Admin
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
          </div>

        </div>
    </PageContainer>
  );
}
