import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import SmartChatbot from "@/components/SmartChatbot";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 py-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16 md:text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-semibold mb-6">
              Features
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Core Capabilities</h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Everything you need to organize host relationships and handle access control natively.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-400 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">Visitor intake</h3>
              <p className="text-sm text-zinc-400">Streamlined data collection upon arrival.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-green-400 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">Guard workspace</h3>
              <p className="text-sm text-zinc-400">A dedicated interface for immediate gate approvals.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-orange-400 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">Entry records</h3>
              <p className="text-sm text-zinc-400">Permanent, queryable logs of every access event.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-purple-400 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">Department setup</h3>
              <p className="text-sm text-zinc-400">Organize your hosts and staff efficiently.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-red-400 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">Access restrictions</h3>
              <p className="text-sm text-zinc-400">Maintain custom lists for denied or warned individuals.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-teal-400 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">QR entry option</h3>
              <p className="text-sm text-zinc-400">Allow self-serve intake scanning at the entrance.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-zinc-400 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">Checkout tracking</h3>
              <p className="text-sm text-zinc-400">Monitor duration and ensure visitors have left.</p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-300 mb-4"></div>
              <h3 className="text-base font-semibold mb-2">Admin overview</h3>
              <p className="text-sm text-zinc-400">High-level insights for building management.</p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
      <SmartChatbot />
    </div>
  );
}