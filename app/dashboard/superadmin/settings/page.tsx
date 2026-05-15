"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { PageContainer } from "@/components/dashboard/shared/AppShell";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isStrongPassword, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/password-policy";
import { KeyRound, Mail, User, Loader2, CheckCircle2, AlertCircle, Settings } from "lucide-react";

export default function SuperadminSettingsPage() {
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
          
        if (profile) setUserName(profile.full_name || "Superadmin");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isStrongPassword(newPassword)) {
      setMessage({ type: "error", text: PASSWORD_REQUIREMENTS_MESSAGE });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    }
    
    setLoading(false);
  };

  return (
    <PageContainer className="max-w-5xl">
      
      <PageHeader
        title="Platform Settings"
        eyebrow="Superadmin security"
        description="Manage your platform operator profile and security credentials."
        icon={Settings}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="md:col-span-1 h-fit rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
          <CardContent className="px-6 py-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.25rem] border border-blue-100 bg-blue-50 text-2xl font-black text-blue-600 shadow-sm md:mx-0">
              {userName ? userName.split(" ").map((name) => name[0]).join("").substring(0, 2).toUpperCase() : <User className="h-8 w-8 text-slate-400" />}
            </div>

            <div className="mt-4 text-center md:text-left">
              <p className="text-xl font-bold text-slate-900">{userName || "Loading..."}</p>
              <p className="mt-1 text-sm font-bold uppercase tracking-wider text-slate-500">Platform Operator</p>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">Full Name</p>
                  <p className="truncate text-sm font-bold text-slate-900">{userName || "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">Email Address</p>
                  <p className="truncate text-sm font-bold text-slate-900">{userEmail || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 h-fit rounded-[1.4rem] border-slate-100 bg-white shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-xl font-bold">
              <KeyRound className="mr-2 h-5 w-5 text-slate-400" /> Password & Security
            </CardTitle>
            <CardDescription>Update your account password to stay secure.</CardDescription>
          </CardHeader>
          <CardContent className="max-w-md">
            <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
              
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="font-bold text-slate-700 text-xs uppercase tracking-wider">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 transition-colors border-slate-200 rounded-xl"
                  placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="font-bold text-slate-700 text-xs uppercase tracking-wider">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
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
                  disabled={loading || !newPassword || !confirmPassword} 
                  className="w-full sm:w-auto h-11 px-8 text-sm font-bold"
                >
                  {loading ? (
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
    </PageContainer>
  );
}
