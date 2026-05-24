import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { publicMetadata } from "@/lib/seo/site";
import { BadgeCheck, ClipboardList, DoorOpen, FileSearch, LockKeyhole, QrCode, ShieldCheck, SlidersHorizontal, UsersRound, WalletCards } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Karibu VMS | Visitor Management System in Kenya",
  description: "Karibu VMS is a digital visitor management system for secure check-ins, QR Pass verification, SMS OTP verification, guard dashboards, host confirmation, and visitor checkout.",
  path: "/",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Karibu VMS",
  applicationCategory: "SecurityApplication",
  operatingSystem: "Web",
  description: "Visitor management system in Kenya for secure check-ins, digital visitor passes, guard dashboards, host confirmation, and checkout.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: "1500",
    priceCurrency: "KES",
    offerCount: "2",
    url: "https://karibuvms.com/pricing",
  },
};

const platformHighlights = [
  {
    title: "Guard desk check-in",
    description: "Register walk-in visitors at reception or the guard desk with the details your organization chooses to collect.",
    icon: ClipboardList,
  },
  {
    title: "QR Pass Verification",
    description: "Premium teams can choose QR Pass Verification so approved visitors receive a secure QR visitor pass and visitor code.",
    icon: QrCode,
  },
  {
    title: "Entry points and gates",
    description: "Set up entry points where needed and assign guards to specific gates or reception points.",
    icon: DoorOpen,
  },
  {
    title: "Visitor intake rules",
    description: "Choose whether to ask for phone numbers, ID details, visit purpose, vehicle registration, photos, host selection, or custom questions.",
    icon: SlidersHorizontal,
  },
  {
    title: "Host confirmation",
    description: "Let hosts confirm that a visitor reached them while guards remain responsible for entry approval.",
    icon: UsersRound,
  },
  {
    title: "Records and review",
    description: "Review visitor history, checkout status, gate activity, and restricted visitor records without searching through paper books.",
    icon: FileSearch,
  },
  {
    title: "Billing and payment tracking",
    description: "Choose a Basic or Premium plan, then track visitor usage, monthly billing summaries, M-Pesa initiation, and payment history.",
    icon: WalletCards,
  },
];

const roleDetails = [
  {
    role: "Company admins",
    details: ["Manage gates, guards, departments, and hosts", "Configure visitor intake rules for your organization", "Review the full visitor log, restricted list, and payment history"],
  },
  {
    role: "Security guards",
    details: ["Register walk-in visitors quickly", "Work from assigned gates or reception points", "Confirm visit details and checkout times"],
  },
  {
    role: "Visitors",
    details: ["Use QR registration when enabled", "Receive a digital visitor pass after approval", "Check out with a visitor code when leaving"],
  },
];

const facilityTypes = ["Corporate offices", "Schools and campuses", "Apartments", "Gated estates", "Clinics", "Warehouses", "Co-working spaces", "Events and temporary sites"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      
      <PublicNavbar />

      {/* --- HERO SECTION --- */}
      <main id="main-content">
      <section className="relative pt-20 pb-32 overflow-hidden bg-zinc-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full mix-blend-normal opacity-50 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full mix-blend-normal opacity-50 blur-3xl pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Digital Visitor Management
              </div> */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.1] mb-6">
                A visitor management system built for modern Kenyan facilities.
              </h1>
              <p className="text-lg text-zinc-600 mb-8 leading-relaxed">
                Karibu VMS helps offices, apartments, schools, and gated spaces manage visitor check-in, guard review, digital visitor passes, host confirmation, and checkout from one clear system.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-xl text-base font-medium transition-all">
                    Book a Demo
                  </Button>
                </a>
                <Link href="/features" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 h-12 px-8 rounded-xl text-base font-medium transition-all">
                    View Features
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Mockup Card */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-green-50 rounded-3xl transform rotate-3 scale-105 opacity-50"></div>
              <div className="relative bg-white border border-zinc-100 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-50">
                  <span className="text-sm font-semibold text-zinc-900">Today&apos;s Activity</span>
                  <span className="text-xs font-medium text-zinc-500">Live</span>
                </div>
                
                <div className="space-y-4">
                  {/* Row 1 */}
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">AJ</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">Alice Johnson</p>
                      <p className="text-xs text-zinc-500">Arrived at 09:00 AM</p>
                    </div>
                    <div className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded uppercase tracking-wide">
                      Inside
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">MK</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">Michael Klein</p>
                      <p className="text-xs text-zinc-500">SMS OTP verification</p>
                    </div>
                    <div className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded uppercase tracking-wide">
                      Pending
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-100 opacity-60">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-sm">SD</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-zinc-900">Sarah Davis</p>
                      <p className="text-xs text-zinc-500">Left at 08:30 AM</p>
                    </div>
                    <div className="px-2 py-1 bg-zinc-200 text-zinc-600 text-[10px] font-bold rounded uppercase tracking-wide">
                      Checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PRODUCT DETAILS --- */}
      <section className="py-24 bg-white border-b border-zinc-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="max-w-3xl mb-14">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">What Karibu VMS gives you</p>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">More control at the gate, better records after the visit.</h2>
            <p className="text-lg text-zinc-600 leading-relaxed">
              Karibu VMS replaces scattered notebooks, message threads, and delayed visitor updates with one shared visitor check-in system for guard registration, QR Pass Verification, SMS OTP visitor verification, visitor rules, checkout, billing, and reporting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white p-7 rounded-2xl border border-zinc-100 shadow-sm">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- INTAKE SETUP --- */}
      <section className="py-24 bg-zinc-50 border-b border-zinc-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Visitor setup</p>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-5 tracking-tight">Configure how visitors enter your building.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">
                Set up entry points, choose the details visitors should provide, and let guards manage arrivals from one clean workspace. Premium teams choose one active verification method: QR Pass Verification or SMS OTP Verification.
              </p>
            </div>

            <div className="grid gap-5">
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Visitor intake rules</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Decide whether to ask for phone numbers, ID details, visit purpose, vehicle registration, photos, host selection, or custom questions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-50 text-green-700 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Digital visitor pass and verification controls</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Add digital visitor passes, host confirmation, custom questions, restricted visitor checks, and department routing where your workflow needs them.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 bg-white border-b border-zinc-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4 tracking-tight">How the flow works</h2>
            <p className="text-lg text-zinc-600">A clear and simple process for every person entering your gates.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div aria-hidden="true" data-step="01" className="mb-6 text-5xl font-black text-zinc-100 transition-colors before:content-[attr(data-step)] group-hover:text-blue-50" />
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Visitor arrives</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The visitor approaches a reception point, gate, or QR check-in poster.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div aria-hidden="true" data-step="02" className="mb-6 text-5xl font-black text-zinc-100 transition-colors before:content-[attr(data-step)] group-hover:text-orange-50" />
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Capture details</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                A guard or QR form captures the details required by your visitor intake rules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div aria-hidden="true" data-step="03" className="mb-6 text-5xl font-black text-zinc-100 transition-colors before:content-[attr(data-step)] group-hover:text-green-50" />
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Entry reviewed</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Guards approve entry after reviewing host, department, gate, or restricted visitor records.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              <div aria-hidden="true" data-step="04" className="mb-6 text-5xl font-black text-zinc-100 transition-colors before:content-[attr(data-step)] group-hover:text-zinc-100" />
              <h3 className="text-xl font-bold text-zinc-900 mb-3">Visit recorded</h3>
              <p className="text-zinc-600 text-sm leading-relaxed">
                The visit is logged to the dashboard, hosts can confirm arrival, and checkout closes the record later.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- ROLE DETAILS --- */}
      <section className="py-24 bg-zinc-50 border-b border-zinc-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Built for the whole visit flow</p>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-5 tracking-tight">Each person sees the tools they need.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                The system separates admin, guard, and visitor responsibilities so your team can move quickly while sensitive controls stay with the right people.
              </p>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white text-blue-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 mb-2">Designed for accountable access</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      Every visit can carry a clear trail: visitor identity, host destination, guard action, arrival time, checkout time, and provider payment reference when billing applies.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              {roleDetails.map((item) => (
                <div key={item.role} className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-zinc-900 mb-4">{item.role}</h3>
                  <div className="grid gap-3">
                    {item.details.map((detail) => (
                      <div key={detail} className="flex items-start gap-3 text-sm text-zinc-600">
                        <BadgeCheck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
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

      {/* --- FACILITY FIT --- */}
      <section className="py-24 bg-white border-b border-zinc-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Where it fits</p>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-5 tracking-tight">Useful for busy entrances and controlled spaces.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                Whether you run one reception desk or several gates, Karibu VMS helps standardize the way people enter, get reviewed, and leave.
              </p>
              <div className="flex flex-wrap gap-3">
                {facilityTypes.map((facility) => (
                  <span key={facility} className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700">
                    {facility}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950 rounded-3xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-green-400/15 text-green-300 flex items-center justify-center">
                  <LockKeyhole className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Security-first records</h3>
                  <p className="text-sm text-zinc-400">Structured logs your team can actually use.</p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm text-zinc-300">Visitor status tracking</span>
                  <span className="text-sm font-semibold text-green-300">Included</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm text-zinc-300">Guard and admin dashboards</span>
                  <span className="text-sm font-semibold text-green-300">Included</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-sm text-zinc-300">Blacklist workflows</span>
                  <span className="text-sm font-semibold text-green-300">Included</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">M-Pesa billing support</span>
                  <span className="text-sm font-semibold text-green-300">Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 bg-blue-600 text-white text-center">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to improve your gate flow?</h2>
          <p className="text-white/90 text-lg mb-10 leading-relaxed">
            Book a demo on WhatsApp and see how Karibu VMS can support office visitor management, apartment visitor management, or school visitor management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-white text-blue-600 hover:bg-zinc-50 h-14 px-8 rounded-xl text-base font-bold shadow-lg transition-all">
                Book Demo
              </Button>
            </a>
            <a href="tel:+254702104690" className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4 text-white/90 hover:text-white font-medium text-sm transition-colors">
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
