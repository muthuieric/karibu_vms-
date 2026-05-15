import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact Karibu VMS | Visitor Management Support",
  description: "Contact the Karibu VMS team for help setting up a digital visitor management process for your office, school, apartment, or gated facility.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 py-32">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-6">
            Contact Us
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4 tracking-tight">Need help setting up?</h1>
          <p className="text-lg text-zinc-600 mb-10 max-w-xl mx-auto">
            Our support team is ready to help you implement a seamless visitor process for your specific facility.
          </p>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-lg mx-auto text-left mt-8">
            <div className="space-y-5">
              <div>
                <p className="block text-sm font-semibold text-zinc-900 mb-2">Email Address</p>
                <div className="w-full h-11 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center px-4 text-zinc-400 text-sm">
                  hello@example.com
                </div>
              </div>
              <div>
                <p className="block text-sm font-semibold text-zinc-900 mb-2">Phone Number</p>
                <div className="w-full h-11 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center px-4 text-zinc-400 text-sm">
                  +1 (555) 000-0000
                </div>
              </div>
              <div>
                <p className="block text-sm font-semibold text-zinc-900 mb-2">Message</p>
                <div className="w-full h-24 rounded-lg bg-zinc-50 border border-zinc-200 flex px-4 py-3 text-zinc-400 text-sm">
                  How can we help...
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-12 text-base font-medium transition-colors" asChild>
                <a href="https://wa.me/254706123513" target="_blank" rel="noopener noreferrer">
                Contact Sales
                </a>
              </Button>
            </div>
            <p className="text-center text-xs text-zinc-500 mt-6">
              We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
      <LazySmartChatbot />
    </div>
  );
}
