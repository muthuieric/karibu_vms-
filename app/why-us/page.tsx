import React from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import SmartChatbot from "@/components/SmartChatbot";

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 py-32 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
              Why Us
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">Why organizations switch to our platform</h1>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
              We focus on making the entry process frictionless while maintaining rigorous records. Eliminate paper logbooks and confusing software.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mt-12">
            <div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-sm"></div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 mb-1">Faster visitor entry</h4>
                    <p className="text-sm text-zinc-600">Speed up processing at the gate, reducing wait times and frustration.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 mb-1">Better security records</h4>
                    <p className="text-sm text-zinc-600">Maintain accurate, searchable digital history that can be audited anytime.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 mb-1">Clear guard workflow</h4>
                    <p className="text-sm text-zinc-600">Provide your security staff with simple, focused tools that reduce errors.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 bg-zinc-500 rounded-sm"></div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-zinc-900 mb-1">Less paperwork</h4>
                    <p className="text-sm text-zinc-600">Remove physical logbooks entirely from your reception area.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-50 rounded-[2rem] p-8 md:p-12 border border-zinc-100">
               <div className="space-y-6">
                 {/* Abstract visual elements replacing the text list for a clean SaaS look */}
                 <div className="h-12 bg-white rounded-xl border border-zinc-100 flex items-center px-4 gap-4 w-full shadow-sm">
                    <div className="w-6 h-6 rounded bg-blue-100"></div>
                    <div className="h-2 w-24 bg-zinc-200 rounded-full"></div>
                 </div>
                 <div className="h-12 bg-white rounded-xl border border-zinc-100 flex items-center px-4 gap-4 w-4/5 ml-auto shadow-sm">
                    <div className="w-6 h-6 rounded bg-green-100"></div>
                    <div className="h-2 w-32 bg-zinc-200 rounded-full"></div>
                 </div>
                 <div className="h-12 bg-white rounded-xl border border-zinc-100 flex items-center px-4 gap-4 w-11/12 shadow-sm">
                    <div className="w-6 h-6 rounded bg-orange-100"></div>
                    <div className="h-2 w-20 bg-zinc-200 rounded-full"></div>
                 </div>
                 <div className="h-12 bg-white rounded-xl border border-zinc-100 flex items-center px-4 gap-4 w-full shadow-sm">
                    <div className="w-6 h-6 rounded bg-zinc-200"></div>
                    <div className="h-2 w-28 bg-zinc-200 rounded-full"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
      <SmartChatbot />
    </div>
  );
}