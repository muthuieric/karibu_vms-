import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import {
  BadgeCheck,
  BellRing,
  Building2,
  ClipboardList,
  FileSearch,
  KeyRound,
  LogOut,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  UsersRound,
} from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Karibu VMS Features | QR Pass, SMS OTP, Visitor Checkout",
  description:
    "Explore Karibu VMS features including QR Pass Verification, SMS OTP visitor verification, digital visitor passes, host confirmation, guard dashboards, admin dashboards, visitor rules, and checkout.",
  path: "/features",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const featureGroups = [
  {
    title: "Visitor flow",
    eyebrow: "Visitor experience",
    heading: "Make arrivals, approvals, and checkout easier to control.",
    description: "Guide visitors from arrival to checkout with QR registration, digital passes, host context, and clear visitor rules.",
    features: [
      { title: "QR Pass Verification", description: "Premium teams can choose QR Pass Verification so approved visitors receive a QR visitor pass and visitor code for the active visit.", icon: QrCode },
      { title: "SMS OTP Verification", description: "Premium teams can choose SMS OTP visitor verification when phone-based visitor check-in is the better fit for the site.", icon: KeyRound },
      { title: "Digital Visitor Pass", description: "Give approved visitors a digital visitor pass that shows status, pass code, time in, and checkout state.", icon: Smartphone },
      { title: "Host Confirmation", description: "Hosts confirm that visitors reached them while guards remain responsible for approving entry.", icon: BellRing },
      { title: "Visitor Checkout", description: "Close active visits separately with a visitor code so time out and pass expiry are recorded cleanly.", icon: LogOut },
      { title: "Visitor Rules", description: "Choose the details visitors must provide before entry, such as phone number, ID number, purpose, vehicle details, photo capture, host selection, or custom questions.", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Security operations",
    eyebrow: "Guard and gate teams",
    heading: "Give your security team cleaner tools for better decisions.",
    description: "Support guards with a focused dashboard for registration, review, restricted alerts, verification, and checkout.",
    features: [
      { title: "Guard Dashboard", description: "Give guards a focused dashboard to register visitors, approve QR Pass visitors, send or verify SMS OTP visitors, and check out active guests.", icon: ShieldAlert },
      { title: "Visitor records", description: "Keep searchable records with arrival time, checkout state, host details, gate context, and visitor status.", icon: FileSearch },
      { title: "Restricted visitor list", description: "Keep restricted visitor records visible to guards and admins before entry decisions.", icon: BadgeCheck },
      { title: "One active verification method", description: "Premium workspaces choose QR Pass Verification or SMS OTP Verification as the active visitor verification method.", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Administration",
    eyebrow: "Admin control",
    heading: "Keep facility records organized as your operation grows.",
    description: "Manage guards, departments, hosts, gates, visitor settings, and billing from a cleaner administration workflow.",
    features: [
      { title: "Admin Dashboard", description: "Review visitor logs, manage gates, configure departments and hosts, and track billing from a central admin dashboard.", icon: ClipboardList },
      { title: "Departments, teams, and hosts", description: "Organize hosts by department for smoother visitor routing and cleaner daily records.", icon: Building2 },
      { title: "Guard management", description: "Create guard accounts and assign operational access without exposing admin tools.", icon: UsersRound },
      { title: "Office, apartment, and school visitor management", description: "Use one visitor management system for receptions, apartments, schools, campuses, offices, and controlled entrances.", icon: Building2 },
    ],
  },
];

const workflowSteps = [
  "Visitor arrives or scans QR",
  "Details are captured",
  "Guard reviews entry",
  "Visit is tracked while inside",
  "Checkout closes the record",
];

const heroStats = [
  { label: "Visitor intake", value: "QR + Guard" },
  { label: "Records", value: "Searchable" },
  { label: "Controls", value: "Role-based" },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white py-24 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Karibu VMS features
                </div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">
                  Everything your team needs to manage visitor entry.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                  Karibu VMS brings QR visitor pass workflows, SMS OTP visitor verification, guard registration, visitor rules, host confirmation, checkout, records, reporting, and billing into one connected platform.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="h-12 w-full rounded-xl bg-blue-600 px-7 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:w-auto">Book Demo</Button>
                  </a>
                  <Link href="/pricing" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-zinc-200 bg-white px-7 font-semibold text-zinc-800 hover:bg-zinc-50 sm:w-auto">View Pricing</Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/10">
                <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Core workflow</p>
                  <div className="mt-5 grid gap-3">
                    {workflowSteps.map((step, index) => (
                      <div key={step} className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700">{String(index + 1).padStart(2, "0")}</span>
                        <span className="text-sm font-medium text-zinc-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{stat.label}</p>
                  <p className="mt-2 text-xl font-black text-zinc-950">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {featureGroups.map((group, groupIndex) => (
          <section key={group.title} className={`border-b py-24 ${groupIndex % 2 === 0 ? "border-zinc-50 bg-white" : "border-zinc-100 bg-zinc-50"}`}>
            <div className="container mx-auto max-w-6xl px-6">
              <div className="mb-12 max-w-3xl">
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">{group.eyebrow}</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">{group.heading}</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">{group.description}</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {group.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-3xl border border-zinc-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-black text-zinc-950">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </main>

      <PublicFooter />
      <LazySmartChatbot />
    </div>
  );
}
