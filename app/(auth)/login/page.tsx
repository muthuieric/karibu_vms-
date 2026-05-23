"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthCard, AuthShell } from "@/components/auth/AuthShell";
import { AuthTurnstile } from "@/components/auth/AuthTurnstile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginPage } from "@/hooks/useAuthPages";

export default function LoginPage() {
  const login = useLoginPage();

  return (
    <AuthShell>
      <AuthCard>
        <div className="text-center mb-8">
          <Image
            src="/logo.svg"
            alt="Karibu VMS logo"
            width={140}
            height={46}
            className="mx-auto mb-6 h-11 w-auto"
            priority
          />
          <h1 className="text-3xl font-semibold text-zinc-900 tracking-tight">Welcome back</h1>
          <p className="mt-2 text-zinc-500 text-sm">
            Access your workspace to manage visits, teams, and entry records.
          </p>
        </div>
        
        <form onSubmit={login.handleLogin} className="space-y-5">
          {login.error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 break-words" role="alert" aria-live="polite">
              {login.error}
            </div>
          )}

          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-zinc-700 font-medium text-sm">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@organization.com"
              required
              value={login.email}
              onChange={(e) => login.setEmail(e.target.value)}
              className="h-12 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white transition-colors px-4 text-zinc-900"
            />
          </div>

          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-zinc-700 font-medium text-sm">Password</Label>
              <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={login.password}
              onChange={(e) => login.setPassword(e.target.value)}
              className="h-12 rounded-xl border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20 bg-zinc-50 focus:bg-white transition-colors px-4 text-zinc-900"
            />
          </div>

          <AuthTurnstile
            onSuccess={(token) => {
              login.setCaptchaToken(token);
              login.setError(null);
            }}
            onFailure={(message) => {
              login.setCaptchaToken(null);
              login.setError(message);
            }}
          />

          <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-base transition-colors mt-2" disabled={login.loading || (login.isCaptchaEnabled && !login.captchaToken)}>
            {login.loading ? "Signing in..." : "Sign In"}
          </Button>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Don&apos;t have an account? <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-800">Register</Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
