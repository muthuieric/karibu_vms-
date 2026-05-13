"use client";

import Link from "next/link";
import { Loader2, Mail, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordPage } from "@/hooks/useAuthPages";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPasswordPage();

  if (forgotPassword.success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-zinc-100 p-8 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-8 border-green-500/10">
            <ShieldCheck className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Check your email</h2>
          <p className="text-zinc-500 leading-relaxed text-sm">
            We&apos;ve sent a password recovery link to <strong>{forgotPassword.email}</strong>. 
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm font-medium border border-blue-100">
            Please check your spam or junk folder if you don&apos;t see it within a few minutes.
          </div>
          <Button className="w-full h-12 text-base font-bold" asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-zinc-100">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">Reset Password</h2>
          <p className="text-zinc-500 mt-2 text-sm">Enter your admin email to receive a recovery link.</p>
        </div>

        <form onSubmit={forgotPassword.handleSubmit} className="space-y-5 mt-8">
          <div className="space-y-1.5">
            <Label className="text-zinc-700 font-semibold">Work Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
              <Input 
                required 
                type="email" 
                placeholder="admin@building.com" 
                className="pl-10 h-11 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-zinc-900"
                value={forgotPassword.email}
                onChange={(e) => forgotPassword.setEmail(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 mt-6 text-base font-bold bg-zinc-900 hover:bg-zinc-800 shadow-lg" disabled={forgotPassword.loading}>
            {forgotPassword.loading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Sending...</> : <>Send Recovery Link <ArrowRight className="w-5 h-5 ml-2"/></>}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Remembered your password? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
