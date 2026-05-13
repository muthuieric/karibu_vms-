"use client";

import { Loader2, Lock, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordPage } from "@/hooks/useAuthPages";

export default function ResetPasswordPage() {
  const resetPassword = useResetPasswordPage();

  return (
    <div className="min-h-screen flex bg-zinc-50 items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-zinc-100">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Set New Password</h2>
          <p className="text-zinc-500 mt-2 text-sm">Please enter a strong new password below.</p>
        </div>

        <form onSubmit={resetPassword.handleSubmit} className="space-y-5 mt-8">
          <div className="space-y-1.5">
            <Label className="text-zinc-700 font-semibold">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input 
                required 
                type="password" 
                minLength={8}
                placeholder="Min 8 chars, 1 uppercase, 1 symbol" 
                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-zinc-900"
                value={resetPassword.password}
                onChange={(e) => resetPassword.setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-zinc-700 font-semibold">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input 
                required 
                type="password" 
                minLength={8}
                placeholder="Retype new password" 
                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-zinc-900"
                value={resetPassword.confirmPassword}
                onChange={(e) => resetPassword.setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 mt-6 text-base font-bold bg-zinc-900 hover:bg-zinc-800 shadow-lg" disabled={resetPassword.loading}>
            {resetPassword.loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Updating...</> : <>Update Password <ArrowRight className="w-5 h-5 ml-2"/></>}
          </Button>
        </form>
      </div>
    </div>
  );
}
