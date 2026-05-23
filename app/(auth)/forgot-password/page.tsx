"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordPage } from "@/hooks/useAuthPages";
import { AuthTurnstile } from "@/components/auth/AuthTurnstile";
import { AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPasswordPage();

  if (forgotPassword.success) {
    return (
      <AuthShell>
        <div className="w-full text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-success/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-success/15">
            <ShieldCheck className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Check your email</h2>
          <p className="text-text-muted leading-relaxed text-sm">
            We&apos;ve sent a password recovery link to <strong>{forgotPassword.email}</strong>. 
          </p>
          <div className="bg-primary/10 text-primary p-4 rounded-xl text-sm font-medium border border-primary/15">
            Please check your spam or junk folder if you don&apos;t see it within a few minutes.
          </div>
          <Button className="w-full h-12 text-base font-bold" asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
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
            />
          </div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Reset Password</h2>
          <p className="text-text-muted mt-2 text-sm">Enter your admin email to receive a recovery link.</p>
        </div>

        <form onSubmit={forgotPassword.handleSubmit} className="space-y-5 mt-8">
          {forgotPassword.error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600" role="alert" aria-live="polite">
              {forgotPassword.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="recovery-email">Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input 
                id="recovery-email"
                required 
                type="email" 
                placeholder="admin@building.com" 
                className="pl-10 h-11"
                value={forgotPassword.email}
                onChange={(e) => forgotPassword.setEmail(e.target.value)}
              />
            </div>
          </div>

          <AuthTurnstile
            onSuccess={(token) => {
              forgotPassword.setCaptchaToken(token);
              forgotPassword.setError(null);
            }}
            onFailure={(message) => {
              forgotPassword.setCaptchaToken(null);
              forgotPassword.setError(message);
            }}
          />

          <Button type="submit" className="w-full h-12 mt-6 text-base font-bold" disabled={forgotPassword.loading || (forgotPassword.isCaptchaEnabled && !forgotPassword.captchaToken)}>
            {forgotPassword.loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Sending...</> : <>Send Recovery Link <ArrowRight className="w-5 h-5 ml-2"/></>}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Remembered your password? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in here</Link>
        </p>
      </div>
    </AuthShell>
  );
}
