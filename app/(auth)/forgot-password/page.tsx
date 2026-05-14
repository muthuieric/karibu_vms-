"use client";

import Link from "next/link";
import { Loader2, Mail, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordPage } from "@/hooks/useAuthPages";
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
          <div className="mx-auto w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight">Reset Password</h2>
          <p className="text-text-muted mt-2 text-sm">Enter your admin email to receive a recovery link.</p>
        </div>

        <form onSubmit={forgotPassword.handleSubmit} className="space-y-5 mt-8">
          <div className="space-y-1.5">
            <Label>Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input 
                required 
                type="email" 
                placeholder="admin@building.com" 
                className="pl-10 h-11"
                value={forgotPassword.email}
                onChange={(e) => forgotPassword.setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 mt-6 text-base font-bold" disabled={forgotPassword.loading}>
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
