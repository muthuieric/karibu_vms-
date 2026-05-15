"use client";

import { Loader2, Lock, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordPage } from "@/hooks/useAuthPages";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  const resetPassword = useResetPasswordPage();

  return (
    <AuthShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Set New Password</h2>
          <p className="text-text-muted mt-2 text-sm">Please enter a strong new password below.</p>
        </div>

        <form onSubmit={resetPassword.handleSubmit} className="space-y-5 mt-8">
          <div className="space-y-1.5">
            <Label htmlFor="reset-new-password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input 
                id="reset-new-password"
                required 
                type="password" 
                minLength={8}
                placeholder="Min 8 chars, 1 uppercase, 1 symbol" 
                className="pl-10 h-11"
                value={resetPassword.password}
                onChange={(e) => resetPassword.setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input 
                id="reset-confirm-password"
                required 
                type="password" 
                minLength={8}
                placeholder="Retype new password" 
                className="pl-10 h-11"
                value={resetPassword.confirmPassword}
                onChange={(e) => resetPassword.setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 mt-6 text-base font-bold" disabled={resetPassword.loading}>
            {resetPassword.loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Updating...</> : <>Update Password <ArrowRight className="w-5 h-5 ml-2"/></>}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
