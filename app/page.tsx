"use client";

import React from "react";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import SmartChatbot from "@/components/SmartChatbot";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Karibu VMS",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description: "Enterprise Visitor Management System",
  offers: {
    "@type": "Offer",
    price: "29.00",
    priceCurrency: "USD",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      <PublicNavbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-zinc-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full mix-blend-normal opacity-50 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full mix-blend-normal opacity-50 blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Digital Visitor Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.1] mb-6">
                A cleaner way to manage every visit.
              </h1>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Know who is coming in, who is inside, and who has left. Visitor entry made simple for offices, schools, apartments, and gated spaces.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-xl text-base font-medium transition-all">
                    Register Facility
                  </Button>
                </Link>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-12 px-8 rounded-xl text-base font-medium transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Mockup Card */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-green-50 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
              <div className="relative bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-50">
                  <span className="text-sm font-semibold text-zinc-900">Today&apos;s Activity</span>
                  <span className="text-xs font-medium text-zinc-500">Live</span>
                </div>
                
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">AJ</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">Alice Johnson</p>
                      <p className="text-xs text-zinc-500">Arrived at 09:00 AM</p>
                    </div>
                    <div className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase tracking-wide">
                      Inside
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">MK</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">Michael Klein</p>
                      <p className="text-xs text-zinc-500">ID Verification</p>
                    </div>
                    <div className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded uppercase tracking-wide">
                      Review
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 opacity-60">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-sm">SD</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">Sarah Davis</p>
                      <p className="text-xs text-zinc-500">Left at 08:30 AM</p>
                    </div>
                    <div className="px-2 py-1 bg-zinc-200 text-zinc-600 text-[10px] font-bold rounded uppercase tracking-wide">
                      Checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 bg-white border-b border-zinc-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">How the flow works</h2>
            <p className="text-lg text-zinc-600">A clear and simple process for every person entering your gates.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="text-5xl font-black text-zinc-100 mb-6 group-hover:text-blue-50 transition-colors">01</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Visitor arrives</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The visitor approaches the reception or gate facility.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="text-5xl font-black text-zinc-100 mb-6 group-hover:text-orange-50 transition-colors">02</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Capture details</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Guard or a simple QR form is used to securely capture the visitor&apos;s information.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="text-5xl font-black text-zinc-100 mb-6 group-hover:text-green-50 transition-colors">03</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Entry reviewed</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The entry is quickly reviewed or approved against host records.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div className="text-5xl font-black text-zinc-100 mb-6 group-hover:text-zinc-100 transition-colors">04</div>
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Visit recorded</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The visit is logged to the dashboard and checkout time is tracked later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to improve your gate flow?</h2>
          <p className="text-blue-100 text-lg mb-10 leading-relaxed">
            Start maintaining better records, organizing hosts, and securing your entry points today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-zinc-50 h-14 px-8 rounded-xl text-base font-bold shadow-lg transition-all">
                Register Now
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4 text-blue-100 hover:text-white font-medium text-sm transition-colors">
              Sign In to existing account
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />

      <SmartChatbot />

      <Script
        id="karibu-vms-software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
    </div>
  );
}