import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { AlertTriangle, BadgeCheck, Building2, Clock3, DoorOpen, FileSearch, ShieldCheck, SlidersHorizontal, UserCheck } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Why Karibu VMS | Faster, Cleaner Visitor Entry",
  description: "See why organizations use Karibu VMS to speed up visitor entry, improve security records, simplify guard workflows, and remove paper logbooks.",
  path: "/why-us",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const reasons = [
  {
    title: "Flexible entry setup",
    description: "Use one reception point or multiple gates depending on how your facility receives visitors.",
    icon: DoorOpen,
  },
  {
    title: "Configurable visitor intake",
    description: "Choose the details visitors must provide, including purpose, host, vehicle details, ID details, or custom questions.",
    icon: SlidersHorizontal,
  },
  {
    title: "Cleaner guard workflow",
    description: "Guards can register guests, review arrivals, manage entry decisions, and complete checkout from one place.",
    icon: Clock3,
  },
  {
    title: "Department-aware routing",
    description: "Organize hosts by team or department so visitors are connected to the right person faster.",
    icon: Building2,
  },
  {
    title: "Better security records",
    description: "Every entry can include timestamps, visitor identity, destination, guard action, checkout state, and audit-friendly history.",
    icon: FileSearch,
  },
  {
    title: "Clear responsibilities",
    description: "Admins manage setup, guards handle front-desk activity, and visitors use QR registration where it makes sense.",
    icon: UserCheck,
  },
  {
    title: "Risk-aware workflows",
    description: "Restricted visitor lists, statuses, and review workflows help teams notice entries that need extra attention.",
    icon: AlertTriangle,
  },
];

const comparisons = [
  {
    title: "Paper logbooks",
    description: "Hard to search, easy to damage, and slow when teams need to confirm visitor history.",
    status: "Manual",
  },
  {
    title: "Unstructured approvals",
    description: "Quick at first, but weak when you need proper records, checkout history, and accountability.",
    status: "Scattered",
  },
  {
    title: "Generic spreadsheets",
    description: "Flexible for small records, but fragile when gates, guards, departments, hosts, and billing grow.",
    status: "Limited",
  },
  {
    title: "Karibu VMS",
    description: "A purpose-built workflow for check-in, host context, guard actions, checkout, billing, and reporting.",
    status: "Structured",
  },
];

const benefits = [
  "Faster visitor registration during busy hours",
  "Clearer guard and admin responsibilities",
  "More reliable visitor history for follow-up",
  "Better control over gates, hosts, and departments",
];

export default function WhyUsPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white py-24 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  Why Karibu VMS
                </div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">
                  Built for teams that need faster entry and reliable visitor records.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                  Karibu VMS helps organizations move beyond paper visitor books while keeping the flow simple for guards, admins, hosts, and visitors.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="h-12 w-full rounded-xl bg-blue-600 px-7 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:w-auto">Book a Demo</Button>
                  </a>
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-zinc-200 bg-white px-7 font-semibold text-zinc-800 hover:bg-zinc-50 sm:w-auto">Compare Plans</Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/10">
                <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Before vs after</p>
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                      <p className="text-sm font-bold text-zinc-950">Before</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">Visitor details are spread across paper books, manual notes, and hard-to-search records.</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <p className="text-sm font-bold text-blue-900">After Karibu VMS</p>
                      <p className="mt-2 text-sm leading-6 text-blue-900/75">Check-in, review, host context, checkout, and records stay organized in one workflow.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Why teams choose it</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">A visitor system should support real gate operations.</h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600">
                The system is designed around the daily pressure points of visitor entry: speed, accountability, host context, records, and checkout.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="rounded-3xl border border-zinc-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-black text-zinc-950">{reason.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{reason.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-100 bg-zinc-50 py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">The difference</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Less improvising, more reliable entry management.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-600">
                  Visitor management starts to break down when records live in too many places. Karibu VMS gives teams one operating view for reception, gates, hosts, departments, visitor rules, and the back office.
                </p>
                <div className="mt-8 grid gap-3">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3 text-sm text-zinc-700">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                {comparisons.map((item) => {
                  const isKaribu = item.title === "Karibu VMS";
                  return (
                    <div key={item.title} className={`rounded-3xl border p-6 shadow-sm ${isKaribu ? "border-blue-200 bg-blue-50" : "border-zinc-100 bg-white"}`}>
                      <div className="flex items-start gap-4">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${isKaribu ? "bg-white text-blue-700" : "bg-zinc-100 text-zinc-500"}`}>
                          {isKaribu ? <BadgeCheck className="h-5 w-5" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-black text-zinc-950">{item.title}</h3>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${isKaribu ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-500"}`}>{item.status}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="rounded-[2rem] bg-blue-600 p-8 text-white md:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight md:text-4xl">A better visitor flow should feel calm, not complicated.</h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
                    Start with the essentials, then grow into higher visitor capacity, department-based routing, photo capture, and verification when your facility needs more control.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link href="/features">
                    <Button className="h-12 w-full rounded-xl bg-white px-7 font-bold text-blue-600 hover:bg-zinc-50">View Features</Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-white/40 bg-transparent px-7 font-bold text-white hover:bg-white/10">View Pricing</Button>
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
