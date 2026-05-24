import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { BadgeCheck, BellRing, Building2, ClipboardList, FileSearch, KeyRound, LogOut, QrCode, ShieldAlert, SlidersHorizontal, Smartphone, UsersRound } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Karibu VMS Features | QR Pass, SMS OTP, Visitor Checkout",
  description: "Explore Karibu VMS features including QR Pass Verification, SMS OTP visitor verification, digital visitor passes, host confirmation, guard dashboards, admin dashboards, visitor rules, and checkout.",
  path: "/features",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const featureGroups = [
  {
    title: "Visitor flow",
    features: [
      { title: "QR Pass Verification", description: "Premium teams can choose QR Pass Verification so approved visitors receive a QR visitor pass and visitor code for the active visit.", icon: QrCode },
      { title: "SMS OTP Verification", description: "Premium teams can choose SMS OTP visitor verification when phone-based visitor check-in is the better fit for the site.", icon: KeyRound },
      { title: "Digital Visitor Pass", description: "Give approved visitors a digital visitor pass that shows status, pass code, time in, and checkout state.", icon: Smartphone },
      { title: "Host Confirmation", description: "Hosts confirm that visitors reached them; guards remain responsible for approving entry.", icon: BellRing },
      { title: "Visitor Checkout", description: "Close active visits separately with a visitor code so time out and pass expiry are recorded cleanly.", icon: LogOut },
      { title: "Visitor Rules", description: "Choose the details visitors must provide before entry, such as phone number, ID number, purpose of visit, vehicle registration, photo capture, host selection, or custom questions.", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Security operations",
    features: [
      { title: "Guard Dashboard", description: "Give guards a focused dashboard to register visitors, approve QR Pass visitors, send or verify SMS OTP visitors, and check out active guests.", icon: ShieldAlert },
      { title: "Visitor records", description: "Keep searchable records with arrival time, checkout state, host details, gate context, and visitor status.", icon: FileSearch },
      { title: "Restricted visitor list", description: "Keep restricted visitor records visible to guards and admins before entry decisions.", icon: BadgeCheck },
      { title: "One active verification method", description: "Premium workspaces choose QR Pass Verification or SMS OTP Verification as the active visitor verification method.", icon: SlidersHorizontal },
    ],
  },
  {
    title: "Administration",
    features: [
      { title: "Admin Dashboard", description: "Review visitor logs, manage gates, configure departments and hosts, and track billing from a central admin dashboard.", icon: ClipboardList },
      { title: "Departments, teams, and hosts", description: "Organize hosts by department for smoother visitor routing and cleaner daily records.", icon: Building2 },
      { title: "Guard management", description: "Create guard accounts and assign operational access without exposing admin tools.", icon: UsersRound },
      { title: "Office, apartment, and school visitor management", description: "Use one visitor management system for receptions, apartments, schools, campuses, offices, and controlled entrances.", icon: Building2 },
    ],
  },
];

const workflowSteps = ["Visitor arrives or scans QR", "Details are captured", "Guard reviews entry", "Visit is tracked while inside", "Checkout closes the record"];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="py-28 bg-zinc-950 text-white border-b border-zinc-800">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/10 text-xs font-semibold mb-6">
                  Features
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Everything your team needs to manage visitor entry.</h1>
                <p className="text-zinc-300 text-lg leading-relaxed mb-8">
                  Karibu VMS brings QR visitor pass workflows, SMS OTP visitor verification, guard registration, visitor rules, host confirmation, checkout, records, reporting, and billing into one connected visitor management platform.
                </p>
                <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-zinc-950 hover:bg-zinc-100 h-12 px-7 rounded-xl font-bold">Book Demo</Button>
                </a>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <div className="grid gap-3">
                  {workflowSteps.map((step, index) => (
                    <div key={step} className="flex items-center gap-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                      <span className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
                      <span className="text-sm text-zinc-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {featureGroups.map((group, groupIndex) => (
          <section key={group.title} className={`py-24 border-b ${groupIndex % 2 === 0 ? "bg-white border-zinc-50" : "bg-zinc-50 border-zinc-100"}`}>
            <div className="container mx-auto px-6 max-w-6xl">
              <div className="max-w-3xl mb-12">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">{group.title}</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  {group.title === "Visitor flow" && "Make arrivals, approvals, and checkout easier to control."}
                  {group.title === "Security operations" && "Give your security team cleaner tools for better decisions."}
                  {group.title === "Administration" && "Keep facility records organized as your operation grows."}
                </h2>
              </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h3 className="text-base font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">{feature.description}</p>
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
