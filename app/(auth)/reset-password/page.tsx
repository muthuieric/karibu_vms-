"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPasswordPage } from "@/hooks/useAuthPages";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  const resetPassword = useResetPasswordPage();

  if (resetPassword.checkingLink) {
    return (
      <AuthShell>
        <div className="w-full space-y-6 text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-2 shadow-md">
            <Image
              src="/icon.svg"
              alt="Karibu VMS logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <div>
            <h2 className="text-3xl font-bold text-text-main tracking-tight">Checking reset link</h2>
            <p className="text-text-muted mt-2 text-sm">Preparing your secure password update.</p>
          </div>
        </div>
      </AuthShell>
    );
  }

  if (resetPassword.recoveryError) {
    return (
      <AuthShell>
        <div className="w-full space-y-6 text-center animate-in zoom-in-95 duration-500">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-2 shadow-md">
            <Image
              src="/icon.svg"
              alt="Karibu VMS logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-100 bg-red-50">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-text-main tracking-tight">Reset link expired</h2>
            <p className="text-text-muted mt-2 text-sm leading-relaxed">{resetPassword.recoveryError}</p>
          </div>
          <Button className="h-12 w-full text-base font-bold" asChild>
            <Link href="/forgot-password">Request a new reset link</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (resetPassword.success) {
    return (
      <AuthShell>
        <div className="w-full space-y-6 text-center animate-in zoom-in-95 duration-500">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-2 shadow-md">
            <Image
              src="/icon.svg"
              alt="Karibu VMS logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-success/15 bg-success/10">
            <ShieldCheck className="h-10 w-10 text-success" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-text-main tracking-tight">Password updated</h2>
            <p className="text-text-muted mt-2 text-sm">You can now sign in with your new password.</p>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 p-2 shadow-md">
            <Image
              src="/icon.svg"
              alt="Karibu VMS logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Set New Password</h2>
          <p className="text-text-muted mt-2 text-sm">Please enter a strong new password below.</p>
        </div>

        <form onSubmit={resetPassword.handleSubmit} className="space-y-5 mt-8">
          {resetPassword.formError && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600" role="alert" aria-live="polite">
              {resetPassword.formError}
            </div>
          )}

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
                disabled={resetPassword.loading}
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
                disabled={resetPassword.loading}
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
