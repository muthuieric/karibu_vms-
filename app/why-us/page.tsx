import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { AlertTriangle, BadgeCheck, Building2, Clock3, DoorOpen, FileSearch, ShieldCheck, SlidersHorizontal, UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Why Karibu VMS | Faster, Cleaner Visitor Entry",
  description: "See why organizations use Karibu VMS to speed up visitor entry, improve security records, simplify guard workflows, and remove paper logbooks.",
  alternates: { canonical: "/why-us" },
};

const reasons = [
  {
    title: "Flexible entry setup",
    description: "Use one reception point or multiple gates depending on how your site works.",
    icon: DoorOpen,
  },
  {
    title: "Configurable visitor intake",
    description: "Choose what visitors must provide before joining the queue, from visit purpose to vehicle details or custom questions.",
    icon: SlidersHorizontal,
  },
  {
    title: "Cleaner guard workflow",
    description: "Guards can register guests, review arrivals, and manage check-outs from one place.",
    icon: Clock3,
  },
  {
    title: "Department-aware routing",
    description: "Premium workflows can organize hosts by team or department, notify hosts by email, and let them confirm visits.",
    icon: Building2,
  },
  {
    title: "Better security records",
    description: "Every entry can include timestamps, visitor identity, destination, guard action, checkout state, and audit-friendly history.",
    icon: FileSearch,
  },
  {
    title: "Clear responsibilities",
    description: "Admins manage setup and records, guards handle front-desk activity, and visitors use QR registration where it makes sense.",
    icon: UserCheck,
  },
  {
    title: "Risk-aware workflows",
    description: "Restricted visitor lists, status, and review workflows help teams notice entries that need extra attention.",
    icon: AlertTriangle,
  },
];

const comparisons = [
  ["Paper logbooks", "Hard to search, easy to lose, and slow during audits."],
  ["Messaging-only approvals", "Useful for quick updates, but weak for structured history."],
  ["Generic spreadsheets", "Flexible at first, but fragile when gates, guards, and hosts grow."],
  ["Karibu VMS", "A purpose-built workflow for check-in, host context, checkout, billing, and reporting."],
];

export default function WhyUsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        <section className="py-28 bg-white border-b border-zinc-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
                Why Us
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">Built for teams that need speed and accountability at the entrance.</h1>
              <p className="text-lg text-zinc-600 leading-relaxed">
                Karibu VMS helps organizations move beyond paper logbooks while keeping the visitor flow simple enough for guards, admins, hosts, and visitors to use every day.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold mb-2">{reason.title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{reason.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">The difference</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Less improvising, more reliable entry management.</h2>
                <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                  Visitor management starts to break down when records live in too many places. Karibu VMS gives teams one operating view for reception, optional gates, hosts, departments, visitor rules, and the back office.
                </p>
                <Link href="/pricing">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl">Compare Plans</Button>
                </Link>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                {comparisons.map(([title, description], index) => (
                  <div key={title} className={`p-6 ${index !== comparisons.length - 1 ? "border-b border-zinc-100" : ""}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${title === "Karibu VMS" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                        {title === "Karibu VMS" ? <BadgeCheck className="w-5 h-5" aria-hidden="true" /> : <ShieldCheck className="w-5 h-5" aria-hidden="true" />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-zinc-900 mb-1">{title}</h3>
                        <p className="text-sm text-zinc-600 leading-relaxed">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white">
              <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A better visitor flow should feel calm, not complicated.</h2>
                  <p className="text-white/85 text-lg leading-relaxed">
                    Start with the essentials, then grow into higher visitor capacity, department-based host routing, photo capture, and location verification when your facility needs more control.
                  </p>
                </div>
                <Link href="/register">
                  <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-zinc-50 h-12 px-7 rounded-xl font-bold">Start Setup</Button>
                </Link>
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
