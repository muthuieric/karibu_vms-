import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { publicMetadata } from "@/lib/seo/site";
import {
  BadgeCheck,
  ClipboardList,
  DoorOpen,
  FileSearch,
  LockKeyhole,
  QrCode,
  SlidersHorizontal,
  UsersRound,
  WalletCards,
} from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Karibu VMS | Visitor Management System Kenya & Nairobi",
  description:
    "Karibu VMS helps Kenyan offices, apartments and schools manage visitor check-in, QR passes, guard dashboards, host approval and checkout.",
  path: "/",
});

const demoWhatsAppUrl =
  "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Karibu VMS",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description:
    "Visitor management system in Kenya for secure check-ins, digital visitor passes, guard dashboards, host confirmation, and checkout.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "1500",
    priceCurrency: "KES",
    offerCount: "2",
    url: "https://www.karibuvms.com/pricing",
  },
};

const platformHighlights = [
  {
    title: "Guard desk check-in",
    description:
      "Register walk-in visitors at reception or the gate using a structured form instead of a paper book.",
    icon: ClipboardList,
  },
  {
    title: "QR visitor flow",
    description:
      "Let visitors scan a QR code, submit their details, and move through a cleaner approval process.",
    icon: QrCode,
  },
  {
    title: "Gates and entry points",
    description:
      "Create entry points and assign guards to the exact gates or reception areas where they work.",
    icon: DoorOpen,
  },
  {
    title: "Custom visitor rules",
    description:
      "Choose what to collect, including host, purpose, phone number, vehicle details, ID details, and custom questions.",
    icon: SlidersHorizontal,
  },
  {
    title: "Host confirmation",
    description:
      "Help hosts confirm visitor arrival while guards stay in control of entry and checkout actions.",
    icon: UsersRound,
  },
  {
    title: "Searchable records",
    description:
      "Find visitor history, gate activity, checkout status, restricted records, and billing information faster.",
    icon: FileSearch,
  },
];

const steps = [
  {
    label: "01",
    title: "Visitor arrives",
    description: "The visitor reaches a reception desk, gate, or QR check-in poster.",
  },
  {
    label: "02",
    title: "Details are captured",
    description: "A guard or QR form collects the information your organization requires.",
  },
  {
    label: "03",
    title: "Entry is reviewed",
    description: "Security checks host, department, gate, and restricted visitor information.",
  },
  {
    label: "04",
    title: "Visit is recorded",
    description: "The visit stays in the dashboard with arrival, approval, and checkout records.",
  },
];

const roleDetails = [
  {
    role: "Admins",
    details: ["Configure visitor rules", "Manage guards, hosts, gates, and departments", "Review records and billing history"],
  },
  {
    role: "Guards",
    details: ["Register walk-in visitors", "Review submitted details", "Approve entry and manage checkout"],
  },
  {
    role: "Visitors",
    details: ["Scan QR codes when enabled", "Submit visit details", "Receive digital pass or verification instructions"],
  },
];

const facilityTypes = [
  "Corporate offices",
  "Apartments",
  "Schools",
  "Gated estates",
  "Clinics",
  "Warehouses",
  "Co-working spaces",
  "Events",
];

const kenyaUseCases = [
  {
    title: "Office visitor management in Kenya",
    description:
      "Record clients, suppliers, contractors, interview candidates, and investor meetings with host and department context.",
  },
  {
    title: "Apartment and estate visitor logs",
    description:
      "Help guards track residents' visitors, delivery riders, vehicles, service providers, and repeat visits more clearly.",
  },
  {
    title: "School and institution check-in",
    description:
      "Support gate teams handling parents, suppliers, interviews, consultants, and scheduled guests.",
  },
];

const trustPoints = [
  "Built for Nairobi and Kenyan facility workflows",
  "Works for guard desks, receptions, and QR check-in points",
  "Designed for visitor records, access accountability, and faster reviews",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content">
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white py-20 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 rounded-full bg-emerald-100/50 blur-3xl" aria-hidden="true" />

          <div className="container relative z-10 mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">    
                <h1 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                  Replace paper visitor books with a cleaner digital gate flow.
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
                  Karibu VMS helps offices, apartments, schools, and gated spaces manage visitor check-in, guard review, host confirmation, digital passes, and checkout from one simple system.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="h-12 w-full rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 sm:w-auto">
                      Book a Demo
                    </Button>
                  </a>
                  <Link href="/features" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-zinc-200 bg-white px-8 text-base font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 sm:w-auto">
                      View Features
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
                  {trustPoints.map((point) => (
                    <div key={point} className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mx-auto w-full max-w-md lg:max-w-lg">
                <div className="rounded-[2rem] border border-blue-100 bg-white p-4 shadow-2xl shadow-blue-950/10">
                  <div className="rounded-[1.5rem] border border-zinc-100 bg-zinc-50 p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Today&apos;s Activity</p>
                        <h2 className="mt-1 text-lg font-black text-zinc-950">Main Gate</h2>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                        <p className="text-2xl font-black text-zinc-950">26</p>
                        <p className="mt-1 text-xs text-zinc-500">Checked in</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                        <p className="text-2xl font-black text-zinc-950">8</p>
                        <p className="mt-1 text-xs text-zinc-500">Pending</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
                        <p className="text-2xl font-black text-zinc-950">20</p>
                        <p className="mt-1 text-xs text-zinc-500">Checked out</p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">AJ</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-zinc-950">Alice Johnson</p>
                          <p className="text-xs text-zinc-500">Host: Finance Office</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">Inside</span>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-black text-orange-700">MK</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-zinc-950">Michael Kipchoge</p>
                          <p className="text-xs text-zinc-500">Waiting for host confirmation</p>
                        </div>
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-orange-700">Pending</span>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3 opacity-70 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-black text-zinc-600">SW</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-zinc-950">Sarah Wanjiku</p>
                          <p className="text-xs text-zinc-500">Checked out at 08:30 AM</p>
                        </div>
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-600">Departed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-100 bg-white py-8">
          <div className="container mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-2xl font-black text-zinc-950">3</p>
              <p className="mt-1 text-sm text-zinc-600">Main users: admins, guards, and visitors</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-2xl font-black text-zinc-950">QR</p>
              <p className="mt-1 text-sm text-zinc-600">Visitor self check-in and digital pass support</p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-5">
              <p className="text-2xl font-black text-zinc-950">KES</p>
              <p className="mt-1 text-sm text-zinc-600">Plans and billing designed for local teams</p>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-14 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">What Karibu VMS gives you</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">More control at the gate, better records after the visit.</h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600">
                Replace scattered notebooks, message threads, and delayed updates with one visitor check-in system for registration, QR passes, visitor rules, checkout, and reporting.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {platformHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-3xl border border-zinc-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-black text-zinc-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">How it works</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">A simple visit flow your team can follow every day.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-600">
                  The flow is designed for busy entrances where guards need speed, admins need accurate records, and visitors need clear instructions.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {facilityTypes.map((facility) => (
                    <span key={facility} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {steps.map((step) => (
                  <div key={step.label} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <p className="text-4xl font-black text-blue-100">{step.label}</p>
                    <h3 className="mt-4 text-lg font-black text-zinc-950">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Built for the whole visit flow</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Each person sees the tools they need.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-600">
                  Karibu VMS separates admin, guard, and visitor responsibilities so your team can move quickly while sensitive controls stay with the right people.
                </p>

                <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700">
                      <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-zinc-950">Designed for accountable access</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">
                        Every visit can carry a clear trail: visitor identity, host destination, guard action, arrival time, checkout time, and billing reference where applicable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {roleDetails.map((item) => (
                  <div key={item.role} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black text-zinc-950">{item.role}</h3>
                    <div className="mt-4 grid gap-3">
                      {item.details.map((detail) => (
                        <div key={detail} className="flex items-start gap-3 text-sm text-zinc-600">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-950 py-24 text-white">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-300">Visitor management system Kenya</p>
                <h2 className="text-3xl font-black tracking-tight md:text-4xl">A digital visitor logbook for facilities that need better records.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-300">
                  Many facilities still depend on paper books and manual sign-out sheets. That becomes difficult when teams need to confirm who entered, who approved them, and who is still inside.
                </p>
                <p className="mt-5 text-lg leading-8 text-zinc-300">
                  Karibu VMS gives Kenyan teams a practical visitor check-in system with guard workflows, QR visitor passes, visitor rules, host details, checkout, restricted visitor records, and billing visibility.
                </p>
              </div>

              <div className="grid gap-4">
                {kenyaUseCases.map((item) => (
                  <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-lg font-black text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{item.description}</p>
                  </div>
                ))}
                <div className="rounded-3xl border border-blue-400/20 bg-blue-500/10 p-6">
                  <h3 className="text-lg font-black text-white">Explore Kenya-focused pages</h3>
                  <div className="mt-4 grid gap-2 text-sm font-semibold text-blue-200">
                    <Link href="/visitor-management-system-kenya" className="hover:text-white">Visitor Management System Kenya</Link>
                    <Link href="/visitor-management-system-nairobi" className="hover:text-white">Visitor Management System Nairobi</Link>
                    <Link href="/digital-visitor-logbook-kenya" className="hover:text-white">Digital Visitor Logbook Kenya</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-20 text-white">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <WalletCards className="mx-auto mb-5 h-10 w-10 text-blue-100" aria-hidden="true" />
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">Ready to improve your gate flow?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
              Book a demo on WhatsApp and see how Karibu VMS can support office visitor management, apartment visitor management, school visitor management, or gated access workflows.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button className="h-14 w-full rounded-xl bg-white px-8 text-base font-black text-blue-600 shadow-lg transition-colors hover:bg-zinc-50 sm:w-auto">
                  Book Demo
                </Button>
              </a>
              <a href="tel:+254702104690" className="text-sm font-semibold text-white/90 transition-colors hover:text-white">
                Call Sales: +254 702 104 690
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
      <LazySmartChatbot />

      <Script
        id="karibu-vms-software-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
    </div>
  );
}
