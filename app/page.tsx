import React from "react";
import Link from "next/link";
import { 
  QrCode, 
  LayoutDashboard, 
  Users, 
  ArrowRight, 
  Lock, 
  Globe, 
  Zap,
  ShieldAlert,
  Building2,
  Bell,
  CheckCircle2
} from "lucide-react";
import SmartChatbot from "@/components/SmartChatbot";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 font-sans overflow-hidden relative">
      
      {/* --- ENHANCED BACKGROUND --- */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-200/30 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-slate-300/30 blur-[100px] pointer-events-none" />

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center max-w-7xl">
        <div className="flex items-center">
          <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900">karibu-vms</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-indigo-700 transition-all duration-200 ease-in-out hidden sm:block">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="h-10 px-5 rounded-xl text-sm shadow-sm">Register</Button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 container mx-auto px-6 pt-16 md:pt-24 pb-20 text-center flex flex-col items-center max-w-7xl">
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight max-w-5xl leading-[1.05] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          Building Security that moves at the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-900">Speed of Business.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 leading-relaxed">
          The ultra-modern visitor management system designed for automated gates, secure workspaces, and high-traffic facilities. Ditch the paper logbook forever.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="h-14 px-8 text-lg w-full rounded-xl">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-xs font-semibold text-slate-500 mt-2 sm:mt-0 sm:ml-4">No hardware required.<br/>Setup in 5 minutes.</p>
        </div>

        {/* --- COMPREHENSIVE FEATURE GRID --- */}
        <div id="features" className="mt-32 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Everything you need to secure your gates.</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">A complete suite of tools built for building managers and security guards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 text-left animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                <QrCode className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart QR Check-In</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Eliminate queues with self-service registration posters. Visitors scan, fill, and get verified in seconds on their own phones.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-indigo-600 p-8 rounded-3xl border border-indigo-700 shadow-lg transition-all duration-200 ease-in-out">
              <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Live Guard Dashboard</h3>
              <p className="text-indigo-100 font-medium leading-relaxed">
                Real-time monitoring for guards with OCR ID scanning, instant blacklist alerts, and 1-click checkout tools.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
                <ShieldAlert className="w-6 h-6 text-rose-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Automated Blacklisting</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Automatically cross-reference every visitor ID against your building&apos;s custom restricted list to block threats instantly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                <Bell className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Notifications</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Send automated SMS OTP codes to visitors and alert hosts immediately when their guests arrive at the reception.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Role-Based Access</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Granular permissions mean Building Managers see analytics and billing, while Guards only see the tools they need.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Gate Support</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Manage multiple entry points, parking booms, and pedestrian gates all from one centralized cloud dashboard.
              </p>
            </div>

          </div>
        </div>

        {/* --- WORKFLOW SECTION --- */}
        <section id="workflow" className="mt-32 w-full text-left">
          <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative shadow-2xl border border-slate-800">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Zap size={400} /></div>
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">Automation that works for your team.</h2>
              <div className="space-y-12">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-white text-indigo-700 flex items-center justify-center font-black text-xl shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Visitor Self-Registers</h4>
                    <p className="text-slate-300 font-medium leading-relaxed">Scanning the QR code at the gate opens the mobile registration form instantly. No apps to download. They input their ID and Host details.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Automated Verification</h4>
                    <p className="text-slate-300 font-medium leading-relaxed">The system runs the ID number against your building&apos;s restricted list automatically. Guards get an alert immediately if a match is found.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xl shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Instant Gate Entry</h4>
                    <p className="text-slate-300 font-medium leading-relaxed">Once the guard clicks &quot;Approve&quot;, the visitor is logged and receives an SMS entry code or digital pass for automated gate scanning.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- SECURITY & UI MOCKUP SECTION --- */}
        <div id="security" className="mt-32 w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">Data Integrity <br/> & Privacy First.</h2>
            <p className="text-lg text-slate-500 mb-8 font-medium">We understand that visitor data is highly sensitive. karibu-vms is built from the ground up with enterprise-grade encryption and strict data privacy protocols.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 font-bold text-slate-900 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-indigo-50 p-2 rounded-lg"><Lock className="text-indigo-600 w-5 h-5" /></div> 
                AES-256 End-to-End Encryption
              </div>
              <div className="flex items-center gap-4 font-bold text-slate-900 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-emerald-50 p-2 rounded-lg"><Globe className="text-emerald-700 w-5 h-5" /></div> 
                Local Data Sovereignty Compliance
              </div>
              <div className="flex items-center gap-4 font-bold text-slate-900 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-rose-50 p-2 rounded-lg"><ShieldAlert className="text-rose-700 w-5 h-5" /></div> 
                Daily Automated Security Backups
              </div>
            </div>
          </div>
          
          {/* Dashboard CSS Mockup */}
          <div className="relative group perspective-[1000px]">
             <div className="absolute inset-0 bg-indigo-300 rounded-[2.5rem] blur-3xl opacity-20 transition-opacity"></div>
             <div className="relative bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden transform transition-all duration-200 ease-in-out hover:rotate-y-2 hover:scale-[1.02]">
                {/* Mock Browser Header */}
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Guard Dashboard</div>
                </div>
                
                {/* Mock Content */}
                <div className="space-y-4">
                   <div className="flex justify-between items-end mb-6">
                     <div className="space-y-2 w-1/2">
                       <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                       <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
                     </div>
                     <div className="h-8 w-24 bg-indigo-600 rounded-lg"></div>
                   </div>

                   {/* Mock Visitor Card */}
                   <div className="h-20 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between px-6 hover:border-indigo-200 transition-all duration-200 ease-in-out">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-300 rounded-full w-24"></div>
                          <div className="h-2 bg-slate-200 rounded-full w-16"></div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
                      </div>
                   </div>
                   
                   {/* Mock Pending Card */}
                   <div className="h-20 bg-white rounded-2xl border border-slate-100 flex items-center justify-between px-6 opacity-60">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-200 rounded-full w-32"></div>
                          <div className="h-2 bg-slate-100 rounded-full w-20"></div>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-100">
                        Pending
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* --- PRICING SECTION --- */}
        <div id="pricing" className="mt-32 w-full text-center">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Simple, Transparent Pricing</h2>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto mb-16">Choose the plan that fits your facility's security needs.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            {/* Basic Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 relative">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Basic Plan</h3>
              <p className="text-slate-500 font-medium mb-6">For small offices and basic entry logs.</p>
              <div className="text-4xl font-black text-slate-900 mb-8">Free <span className="text-lg font-medium text-slate-500">/ forever</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-indigo-600" /></div> Maximum 1 Guard Account
                </li>
                <li className="flex items-center gap-3 font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-indigo-600" /></div> Direct Guard Approval
                </li>
                <li className="flex items-center gap-3 font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-indigo-600" /></div> Static Printed QR Codes
                </li>
                <li className="flex items-center gap-3 font-semibold text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-indigo-600" /></div> No Photo/ID Scanning
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">Get Started</Button>
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-indigo-600 p-8 rounded-3xl border border-indigo-700 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none"><Zap size={100} /></div>
              <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Premium Plan</h3>
              <p className="text-indigo-100 font-medium mb-6 relative z-10">For high-security facilities and estates.</p>
              <div className="text-4xl font-black text-white mb-8 relative z-10">Custom <span className="text-lg font-medium text-indigo-200">/ volume-based</span></div>
              <ul className="space-y-4 mb-8 relative z-10">
                <li className="flex items-center gap-3 font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div> Unlimited Guard Accounts
                </li>
                <li className="flex items-center gap-3 font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div> SMS OTP & Host Emails
                </li>
                <li className="flex items-center gap-3 font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div> GPS Geofencing
                </li>
                <li className="flex items-center gap-3 font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div> 5-Min Dynamic QR Codes
                </li>
                <li className="flex items-center gap-3 font-semibold text-white">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shrink-0"><CheckCircle2 className="w-4 h-4 text-white" /></div> Guard AI ID Scanning
                </li>
              </ul>
              <Link href="/register">
                <Button className="w-full h-12 bg-white hover:bg-zinc-100 text-indigo-600 rounded-xl relative z-10">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-12 mt-12">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center">
            <span className="text-xl font-black tracking-tighter text-slate-900">karibu-vms</span>
          </div>
          <div className="flex gap-6 text-sm font-bold text-slate-500">
            <a href="#" className="hover:text-indigo-700 transition-all duration-200 ease-in-out">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-700 transition-all duration-200 ease-in-out">Terms of Service</a>
            <a href="#" className="hover:text-indigo-700 transition-all duration-200 ease-in-out">Support</a>
          </div>
          <p className="text-sm font-semibold text-slate-500">
            &copy; {new Date().getFullYear()} karibu-vms. All rights reserved.
          </p>
        </div>
      </footer>

      {/* --- INJECT CHATBOT COMPONENT --- */}
      <SmartChatbot />

    </div>
  );
}
