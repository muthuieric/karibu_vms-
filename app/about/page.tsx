import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import SmartChatbot from "@/components/SmartChatbot";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 flex flex-col justify-center py-32 bg-zinc-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-6">
            About Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">The Modern Standard for Entry</h1>
          <p className="text-xl text-zinc-600 leading-relaxed max-w-3xl mx-auto">
            karibu-vms helps organizations replace manual visitor books with a digital process for check-in, verification, approval, checkout, and visitor records.
          </p>
        </div>
      </main>

      <PublicFooter />
      <SmartChatbot />
    </div>
  );
}