import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { BadgeCheck, Building2, ClipboardCheck, DoorOpen, FileSearch, ShieldCheck, UsersRound } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "About Karibu VMS | Digital Visitor Management",
  description: "Learn how Karibu VMS replaces manual visitor books with digital check-in, verification, approvals, checkout, and searchable visitor records.",
  path: "/about",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const values = [
  {
    title: "Simple at the gate",
    description: "Security teams can register visitors quickly, review details clearly, and manage checkouts without relying on paper books.",
    icon: ClipboardCheck,
  },
  {
    title: "Useful after the visit",
    description: "Every entry creates a searchable record for follow-up, reporting, audits, and better accountability across the facility.",
    icon: FileSearch,
  },
  {
    title: "Built for local operations",
    description: "Karibu VMS supports practical Kenyan workflows including guard dashboards, QR registration, visitor rules, gates, and billing visibility.",
    icon: Building2,
  },
];

const operatingPrinciples = [
  "Know who is inside at any time",
  "Give guards a faster check-in flow",
  "Set up multiple entry points or gates",
  "Choose visitor details and custom fields",
  "Keep host, department, and gate records organized",
  "Make checkout and audit trails easier",
  "Reduce dependency on paper visitor books",
];

const workflowSteps = [
  {
    title: "Arrival",
    description: "A visitor reaches a reception desk, gate, or QR check-in point.",
  },
  {
    title: "Capture",
    description: "The required visitor details are collected based on your organization rules.",
  },
  {
    title: "Review",
    description: "Guards and hosts can review the visit before entry is completed.",
  },
  {
    title: "Record",
    description: "The visit remains available for search, checkout tracking, and reporting.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white py-24 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  About Karibu VMS
                </div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">
                  Helping facilities replace paper entry with accountable digital visitor records.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                  Karibu VMS helps organizations manage visitor arrival, guard review, host details, entry points, checkout, and searchable records from one clean platform.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="h-12 w-full rounded-xl bg-blue-600 px-7 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:w-auto">Book a Demo</Button>
                  </a>
                  <Link href="/features" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-zinc-200 bg-white px-7 text-zinc-800 hover:bg-zinc-50 sm:w-auto">View Features</Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/10">
                <div className="mb-5 flex items-center justify-between border-b border-zinc-100 pb-5">
                  <div>
                    <p className="text-sm font-black text-zinc-950">Facility overview</p>
                    <p className="text-xs text-zinc-500">Example operating snapshot</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4"><span className="text-sm text-zinc-600">Visitors inside</span><span className="text-xl font-black text-zinc-950">24</span></div>
                  <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4"><span className="text-sm text-zinc-600">Pending reviews</span><span className="text-xl font-black text-orange-600">3</span></div>
                  <div className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4"><span className="text-sm text-zinc-600">Completed today</span><span className="text-xl font-black text-emerald-600">118</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Our focus</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">A visitor system should make daily security work easier.</h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600">
                The goal is not just to digitize a sign-in book. It is to help teams capture the right information, apply visitor rules that fit their building, and keep reliable records when questions come up later.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <div key={value.title} className="rounded-3xl border border-zinc-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-black text-zinc-950">{value.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">How we think about operations</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Cleaner movement from arrival to checkout.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-600">
                  Karibu VMS is designed around real movement through a building: arrival, guard or QR registration, optional custom questions, review, entry, time inside, checkout, and historical reporting.
                </p>
                <div className="mt-8 grid gap-3">
                  {operatingPrinciples.map((principle) => (
                    <div key={principle} className="flex items-start gap-3 text-sm text-zinc-700">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{principle}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {workflowSteps.map((step, index) => (
                  <div key={step.title} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="text-lg font-black text-zinc-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="rounded-[2rem] bg-blue-600 p-8 text-white md:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <DoorOpen className="mb-5 h-10 w-10 text-blue-100" aria-hidden="true" />
                  <h2 className="text-3xl font-black tracking-tight md:text-4xl">See how Karibu VMS can fit your facility.</h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90">
                    Review the features, pricing, or book a demo to see how the platform supports your visitor flow.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="h-12 w-full rounded-xl bg-white px-7 font-bold text-blue-600 hover:bg-zinc-50">Book a Demo</Button>
                  </a>
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
