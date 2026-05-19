import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { BadgeCheck, Building2, ClipboardCheck, ShieldCheck, UsersRound } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "About Karibu VMS | Digital Visitor Management",
  description: "Learn how Karibu VMS replaces manual visitor books with digital check-in, verification, approvals, checkout, and searchable visitor records.",
  path: "/about",
});

const values = [
  {
    title: "Simple at the gate",
    description: "Security teams can register visitors at the desk, manage arrivals by gate, and keep checkout clear during busy hours.",
    icon: ClipboardCheck,
  },
  {
    title: "Useful after the visit",
    description: "Every entry should leave behind a clear record that admins can search, review, and use for follow-up.",
    icon: BadgeCheck,
  },
  {
    title: "Built for local operations",
    description: "Karibu VMS supports practical needs like M-Pesa billing, guard dashboards, QR registration, visitor rules, and multi-gate facilities.",
    icon: Building2,
  },
];

const operatingPrinciples = ["Know who is inside at any time", "Give guards a faster check-in flow", "Set up entry points or gates where needed", "Choose visitor details and optional custom fields", "Keep host, department, and gate records organized", "Make checkout and audit trails easier", "Reduce dependency on paper visitor books"];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="py-28 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[1fr_0.85fr] gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-6">
                  About Us
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">Helping facilities replace paper entry with accountable digital records.</h1>
                <p className="text-xl text-zinc-600 leading-relaxed mb-8">
                  Karibu VMS helps organizations replace paper visitor books with a cleaner digital check-in flow. Teams can register visitors at the desk, allow self check-in through QR codes, manage entry points, and keep visitor records in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/register">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl">Register Facility</Button>
                  </Link>
                  <Link href="/features">
                    <Button variant="outline" className="w-full sm:w-auto bg-white border-zinc-200 h-12 px-7 rounded-xl">View Features</Button>
                  </Link>
                </div>
              </div>

              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-5 mb-5">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Facility overview</p>
                    <p className="text-xs text-zinc-500">Live operating snapshot</p>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                    <span className="text-sm text-zinc-600">Visitors inside</span>
                    <span className="text-xl font-bold text-zinc-900">24</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                    <span className="text-sm text-zinc-600">Pending reviews</span>
                    <span className="text-xl font-bold text-orange-600">3</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                    <span className="text-sm text-zinc-600">Completed today</span>
                    <span className="text-xl font-bold text-green-600">118</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white border-b border-zinc-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl mb-12">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Our focus</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A visitor system should make daily security work easier.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">
                The goal is not just to digitize a sign-in book. It is to help teams capture the right information, apply visitor rules that fit their building, and keep reliable records when questions come up later.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="rounded-2xl border border-zinc-100 bg-white p-7 shadow-sm">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-zinc-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-14 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">What we care about</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Cleaner operations from arrival to checkout.</h2>
                <p className="text-lg text-zinc-600 leading-relaxed">
                  Karibu VMS is designed around real movement through a building: arrival, guard or QR registration, optional custom questions, review, entry, time inside, checkout, and historical reporting.
                </p>
              </div>
              <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
                <div className="grid gap-4">
                  {operatingPrinciples.map((principle) => (
                    <div key={principle} className="flex items-start gap-3 text-sm text-zinc-700">
                      <UsersRound className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{principle}</span>
                    </div>
                  ))}
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
