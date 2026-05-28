import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { publicMetadata } from "@/lib/seo/site";
import { ArchiveX, Database, Eye, Fingerprint, LockKeyhole, Mail, ShieldCheck, UserCheck } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Privacy Policy | Karibu VMS",
  description: "Read the Karibu VMS privacy policy covering visitor records, retention, anonymisation, restricted visitors, billing records, security controls, and contact information.",
  path: "/privacy",
});

const sections = [
  {
    title: "Information we collect",
    description: "Karibu VMS may collect account details, facility information, guard and admin profile data, visitor check-in records, host or department details, support messages, payment references, device metadata, and usage activity needed to operate the service.",
    icon: Database,
  },
  {
    title: "Configurable visitor details",
    description: "Facilities can configure which visitor fields are requested, such as phone number, ID or passport number, host, purpose of visit, vehicle registration, and photo capture where enabled. This supports data minimisation by allowing a facility to collect only what it needs.",
    icon: UserCheck,
  },
  {
    title: "How we use information",
    description: "We use information to provide visitor registration, approval, checkout, QR pass verification, guard workflows, reporting, billing, support, security monitoring, troubleshooting, and product improvement.",
    icon: Eye,
  },
  {
    title: "Sensitive visitor fields",
    description: "Where supported by the platform, sensitive fields such as phone numbers, ID or passport numbers, and vehicle registration details are protected using server-side encryption and cryptographic matching values. Plain legacy fields should remain blank for newly protected records.",
    icon: Fingerprint,
  },
  {
    title: "Restricted visitor checks",
    description: "Restricted visitor matching is designed to use stronger identifiers such as phone, ID or passport number, or vehicle registration where those fields are provided. Restricted records may be reviewed and expire separately from normal visitor logs.",
    icon: ShieldCheck,
  },
  {
    title: "Data retention and anonymisation",
    description: "Facilities may configure or request deletion/anonymisation of visitor personal data. The platform can anonymise checked-out visitors and remove personal details while keeping non-sensitive operational history, billing usage, and audit records where required for security, accounting, dispute handling, or legal reasons.",
    icon: ArchiveX,
  },
  {
    title: "Security and audit logs",
    description: "We apply technical and organizational safeguards intended to protect records from unauthorized access, misuse, loss, or alteration. Audit logs record important security events such as sensitive record access, exports, restricted visitor matches, rule changes, and retention actions without intentionally storing raw phone or ID numbers in audit metadata.",
    icon: LockKeyhole,
  },
  {
    title: "Sharing information",
    description: "We do not sell personal information. We may share data with service providers that help operate hosting, database, payment, analytics, communication, and support systems, or where required by law. A facility may also share records with authorized staff, hosts, guards, building management, or lawful authorities where appropriate.",
    icon: ShieldCheck,
  },
  {
    title: "Contact",
    description: "Questions about privacy, visitor data, correction requests, access requests, deletion/anonymisation requests, or account records can be sent through the contact page or by reaching our support team. Visitors may also contact the facility that collected their details.",
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
              This policy explains how Karibu VMS collects, uses, protects, retains, anonymises, and shares information when facilities use the platform to manage visitor entry, guard workflows, payments, support, and administration.
            </p>
            <p className="text-sm text-zinc-500 mt-6">Last updated: May 28, 2026</p>
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
              <h2 className="text-lg font-bold text-zinc-900 mb-2">Facility responsibility and legal compliance</h2>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Each facility or company workspace is responsible for deciding what visitor information it collects, giving appropriate notices to visitors, selecting lawful retention periods, managing access by guards and admins, and responding to visitor requests. Karibu VMS provides tools such as configurable fields, encryption, hashing for matching, audit logs, retention cleanup, and anonymisation to help facilities manage those responsibilities.
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
