"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthTurnstile } from "@/components/auth/AuthTurnstile";
import { useRegisterPage } from "@/hooks/useAuthPages";
import { AuthShell } from "@/components/auth/AuthShell";

export default function RegisterPage() {
  const { loading, success, error, captchaToken, isCaptchaEnabled, formData, setFormData, setCaptchaToken, setError, handleSubmit } = useRegisterPage();

  if (success) {
    return (
      <AuthShell>
        <div className="text-center space-y-6">
          <Image
            src="/logo.svg"
            alt="Karibu VMS logo"
            width={140}
            height={46}
            className="mx-auto h-11 w-auto"
            priority
          />
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-100">
            <span className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">✓</span>
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">Request received</h2>
          <p className="text-zinc-500 leading-relaxed text-sm">
            Your workspace request has been submitted. We will review it and notify you when your account is ready.
          </p>
          <div className="bg-zinc-50 text-zinc-700 p-4 rounded-xl text-sm border border-zinc-100">
            You will receive an email shortly regarding the setup of <strong>{formData.companyName}</strong>.
          </div>
          <Button className="w-full h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors" asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell wide>
        <div className="w-full space-y-8">
          
          <div className="text-left">
            <Image
              src="/logo.svg"
              alt="Karibu VMS logo"
              width={140}
              height={46}
              className="mb-6 h-11 w-auto"
              priority
            />
            <h2 className="text-3xl font-semibold text-zinc-900 tracking-tight">Create your workspace</h2>
            <p className="text-zinc-500 mt-2 text-sm">Set up your organization so your team can manage visitor entry from one place.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Organization Details</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-zinc-700 font-medium text-sm">Company or Building Name</Label>
                  <Input 
                    id="companyName"
                    required 
                    placeholder="e.g.Luffi Tech" 
                    className="h-11 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white px-4 text-zinc-900 transition-colors"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-zinc-700 font-medium text-sm">Physical Address</Label>
                  <Input 
                    id="address"
                    required 
                    placeholder="e.g. Westlands, Nairobi" 
                    className="h-11 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white px-4 text-zinc-900 transition-colors"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Admin Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-zinc-700 font-medium text-sm">Full Name</Label>
                <Input 
                  id="fullName"
                  required 
                  placeholder="John Doe" 
                  className="h-11 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white px-4 text-zinc-900 transition-colors"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workEmail" className="text-zinc-700 font-medium text-sm">Work Email</Label>
                  <Input 
                    id="workEmail"
                    required 
                    type="email" 
                    placeholder="admin@building.com" 
                    className="h-11 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white px-4 text-zinc-900 transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-zinc-700 font-medium text-sm">Phone Number</Label>
                  <Input 
                    id="phone"
                    required 
                    type="tel" 
                    placeholder="+254 7..." 
                    className="h-11 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white px-4 text-zinc-900 transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 border-b border-zinc-100 pb-2">Account Security & Plan</h3>
              
              <div className="space-y-2">
                <Label htmlFor="planTier" className="text-zinc-700 font-medium text-sm">Subscription Plan</Label>
                <div className="relative">
                  <select
                    id="planTier"
                    required
                    className="w-full h-11 pl-4 pr-10 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 appearance-none text-sm font-medium text-zinc-900 outline-none transition-colors cursor-pointer"
                    value={formData.planTier}
                    onChange={(e) => setFormData({...formData, planTier: e.target.value})}
                  >
                    <option value="basic">Basic Plan (Core Features)</option>
                    <option value="premium">Premium Plan (Full Security & OTP)</option>
                    <option value="custom">Enterprise Custom (Contact Us)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="securePassword" className="text-zinc-700 font-medium text-sm">Secure Password</Label>
                  <PasswordInput
                    id="securePassword"
                    required 
                    minLength={8}
                    placeholder="Min 8 characters" 
                    className="h-11 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white px-4 text-zinc-900 transition-colors"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-zinc-700 font-medium text-sm">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    required 
                    minLength={8}
                    placeholder="Retype password" 
                    className="h-11 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white px-4 text-zinc-900 transition-colors"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <AuthTurnstile
              onSuccess={(token) => {
                setCaptchaToken(token);
                setError(null);
              }}
              onFailure={(message) => {
                setCaptchaToken(null);
                setError(message);
              }}
            />

            <Button type="submit" className="w-full h-12 mt-6 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-base transition-colors" disabled={loading || (isCaptchaEnabled && !captchaToken)}>
              {loading ? "Processing..." : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-500 pt-4 border-t border-zinc-100">
            Already have an account? <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-800">Sign in</Link>
          </p>
        </div>
    </AuthShell>
  );
}
