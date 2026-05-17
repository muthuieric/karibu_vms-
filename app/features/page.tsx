import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { BellRing, Building2, Car, ClipboardList, CreditCard, DoorOpen, FileDown, FileSearch, HelpCircle, IdCard, Lock, MapPin, QrCode, ShieldAlert, SlidersHorizontal, UsersRound } from "lucide-react";

export const metadata: Metadata = {
  title: "Karibu VMS Features | Check-In, Guard Tools, Entry Records",
  description: "Explore Karibu VMS features including visitor intake, guard dashboards, QR entry, checkout tracking, departments, access restrictions, and admin records.",
  alternates: { canonical: "/features" },
};

const featureGroups = [
  {
    title: "Visitor flow",
    features: [
      { title: "QR self check-in", description: "Publish a facility QR link so visitors can start registration from their own phones.", icon: QrCode },
      { title: "Guard desk registration", description: "Let guards register walk-in guests, review arrivals, and manage check-outs from a focused workspace.", icon: ClipboardList },
      { title: "Visitor records", description: "Keep searchable records with arrival time, checkout state, host details, gate context, and visitor status.", icon: FileSearch },
      { title: "Entry points", description: "Set up gates, receptions, or building entry points and assign guards where needed.", icon: DoorOpen },
      { title: "Visitor rules", description: "Choose what information guests must provide before entry, such as phone number, ID number, purpose of visit, vehicle registration, photo capture, host selection, or custom questions.", icon: SlidersHorizontal },
      { title: "Photo and ID requirements", description: "Collect ID details when required. Premium workflows can also require visitor photo capture for stronger verification records.", icon: IdCard },
    ],
  },
  {
    title: "Security operations",
    features: [
      { title: "Vehicle registration", description: "Ask for vehicle registration details when your site needs drive-in or delivery records.", icon: Car },
      { title: "Custom questions", description: "Ask site-specific questions such as equipment details, delivery reference, safety checks, or appointment notes.", icon: HelpCircle },
      { title: "Geofence controls", description: "Premium gate rules can limit visitor registration to the correct physical area.", icon: MapPin },
      { title: "Restricted visitor list", description: "Keep restricted visitor records visible to guards and admins before entry decisions.", icon: Lock },
      { title: "Host email confirmation", description: "Premium workflows can email the host so they can confirm the visitor after checking the visit code.", icon: BellRing },
      { title: "Guard workspace", description: "A focused dashboard for guards to register, review, and manage visitors at active gates.", icon: ShieldAlert },
    ],
  },
  {
    title: "Administration",
    features: [
      { title: "Departments, teams, and hosts", description: "Organize hosts by department for smoother visitor routing and cleaner daily records.", icon: Building2 },
      { title: "Guard management", description: "Create guard accounts and assign operational access without exposing admin tools.", icon: UsersRound },
      { title: "Payment and account status", description: "Track plan, usage, monthly charges, M-Pesa initiation, and payment history.", icon: CreditCard },
    ],
  },
];

const workflowSteps = ["Visitor arrives or scans QR", "Details are captured", "Guard reviews entry", "Visit is tracked while inside", "Checkout closes the record"];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        <section className="py-28 bg-zinc-950 text-white border-b border-zinc-800">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[1fr_0.9fr] gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-zinc-200 border border-white/10 text-xs font-semibold mb-6">
                  Features
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Everything your team needs to manage visitor entry.</h1>
                <p className="text-zinc-300 text-lg leading-relaxed mb-8">
                  Karibu VMS brings self check-in, guard registration, entry points, visitor rules, host context, restricted visitor checks, records, reporting, and billing into one connected visitor management platform.
                </p>
                <Link href="/pricing">
                  <Button className="bg-white text-zinc-950 hover:bg-zinc-100 h-12 px-7 rounded-xl font-bold">See Pricing</Button>
                </Link>
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
