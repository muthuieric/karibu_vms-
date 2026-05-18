import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { Building2, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Karibu VMS | Visitor Management Support",
  description: "Contact the Karibu VMS team for help setting up a digital visitor management process for your office, school, apartment, or gated facility.",
  alternates: { canonical: "/contact" },
};

const supportTopics = ["One reception point or multiple gates", "Guard account and gate assignments", "QR self check-in or simple desk registration", "Host routing and department setup", "Host email confirmation", "Custom visitor questions", "Plan, billing, and M-Pesa support"];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        <section className="py-28 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-14 items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-6">
                  Contact Us
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-5 tracking-tight">Need help setting up visitor management?</h1>
                <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                  Tell us how your building receives visitors. We can help you decide whether you need one entry point, multiple gates, host routing, custom visitor questions, or simple desk registration.
                </p>

                <div className="grid gap-4">
                  <a href="https://wa.me/254702104690" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-100 p-5 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">WhatsApp sales</p>
                      <p className="text-sm text-zinc-600">+254 702 104 690</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-100 p-5 shadow-sm">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Mail className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Email support</p>
                      <p className="text-sm text-zinc-600">karibuvms@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-2xl bg-white border border-zinc-100 p-5 shadow-sm">
                    <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
                      <Phone className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Response time</p>
                      <p className="text-sm text-zinc-600">Most messages are reviewed within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Need help choosing a setup?</h2>
                    <p className="text-sm text-zinc-600 leading-relaxed">A little context helps us recommend the right setup faster.</p>
                  </div>
                </div>

                <div className="grid gap-4 mb-8">
                  {supportTopics.map((topic) => (
                    <div key={topic} className="flex items-start gap-3 text-sm text-zinc-700">
                      <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 text-base font-medium transition-colors" asChild>
                    <a href="https://wa.me/254702104690" target="_blank" rel="noopener noreferrer">
                      Contact Sales
                    </a>
                  </Button>
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full bg-white border-zinc-200 rounded-xl h-12 text-base font-medium">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
      <LazySmartChatbot />
    </div>
  );
}
