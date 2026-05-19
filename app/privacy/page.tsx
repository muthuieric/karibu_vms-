import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { publicMetadata } from "@/lib/seo/site";
import { Database, Eye, LockKeyhole, Mail, ShieldCheck, UserCheck } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Privacy Policy | Karibu VMS",
  description: "Read the Karibu VMS privacy policy covering visitor records, account data, payment records, security controls, and contact information.",
  path: "/privacy",
});

const sections = [
  {
    title: "Information we collect",
    description: "Karibu VMS may collect account details, facility information, guard and admin profile data, visitor check-in records, host or department details, support messages, payment references, device metadata, and usage activity needed to operate the service.",
    icon: Database,
  },
  {
    title: "How we use information",
    description: "We use information to provide visitor registration, approval, checkout, reporting, billing, support, security monitoring, troubleshooting, and product improvement.",
    icon: UserCheck,
  },
  {
    title: "Visitor records",
    description: "Visitor data may include names, contact details, ID-related information, photos when enabled, arrival and checkout times, host destination, gate, status, and guard actions. Facilities control how this information is captured and used within their workspace.",
    icon: Eye,
  },
  {
    title: "Security",
    description: "We apply technical and organizational safeguards intended to protect records from unauthorized access, misuse, loss, or alteration. No online service can guarantee absolute security, but we work to keep access limited and accountable.",
    icon: LockKeyhole,
  },
  {
    title: "Sharing information",
    description: "We do not sell personal information. We may share data with service providers that help operate hosting, database, payment, analytics, communication, and support systems, or where required by law.",
    icon: ShieldCheck,
  },
  {
    title: "Contact",
    description: "Questions about privacy, visitor data, correction requests, or account records can be sent through the contact page or by reaching our support team.",
    icon: Mail,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="py-24 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-6">
              Privacy Policy
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">How Karibu VMS handles privacy and data.</h1>
            <p className="text-lg text-zinc-600 leading-relaxed">
              This policy explains how Karibu VMS collects, uses, protects, and shares information when facilities use the platform to manage visitor entry, guard workflows, payments, support, and administration.
            </p>
            <p className="text-sm text-zinc-500 mt-6">Last updated: May 17, 2026</p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid gap-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-2">{section.title}</h2>
                        <p className="text-sm text-zinc-600 leading-relaxed">{section.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-2">Data retention and access</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Facilities are responsible for deciding what visitor information they collect and how long they need to keep it for operational, security, legal, or compliance reasons. Account admins can review records inside their workspace, and support can help with access or correction questions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
      <LazySmartChatbot />
    </div>
  );
}
