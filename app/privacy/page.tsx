import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { ArchiveX, BadgeCheck, Database, Eye, Fingerprint, LockKeyhole, Mail, ShieldCheck, UserCheck } from "lucide-react";

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
    title: "Contact and requests",
    description: "Questions about privacy, visitor data, correction requests, access requests, deletion/anonymisation requests, or account records can be sent through the contact page or by reaching our support team. Visitors may also contact the facility that collected their details.",
    icon: Mail,
  },
];

const summaryPoints = [
  "Facilities choose the visitor details they collect.",
  "Visitor records can support check-in, approval, checkout, reporting, and security review.",
  "Retention and anonymisation tools help reduce personal data where appropriate.",
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white py-24 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-6xl px-6">
            <div className="grid items-start gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  Privacy Policy
                </div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">How Karibu VMS handles privacy and visitor data.</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                  This policy explains how Karibu VMS collects, uses, protects, retains, anonymises, and shares information when facilities use the platform to manage visitor entry, guard workflows, payments, support, and administration.
                </p>
                <p className="mt-6 text-sm font-semibold text-zinc-500">Last updated: May 28, 2026</p>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/10">
                <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Privacy summary</p>
                  <div className="mt-5 grid gap-3">
                    {summaryPoints.map((point) => (
                      <div key={point} className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                        <p className="text-sm font-medium leading-6 text-zinc-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Policy details</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Clear rules for visitor records, access, security, and retention.</h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600">
                Karibu VMS is designed to support controlled visitor management workflows while helping organizations manage visitor information responsibly.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <article key={section.title} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-zinc-950">{section.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-zinc-600">{section.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-950 md:text-3xl">Facility responsibility and legal compliance</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-700">
                    Each facility or company workspace is responsible for deciding what visitor information it collects, giving appropriate notices to visitors, selecting lawful retention periods, managing access by guards and admins, and responding to visitor requests. Karibu VMS provides tools such as configurable fields, encryption, hashing for matching, audit logs, retention cleanup, and anonymisation to help facilities manage those responsibilities.
                  </p>
                </div>
                <Link href="/contact">
                  <Button className="h-12 w-full rounded-xl bg-blue-600 px-7 font-bold text-white hover:bg-blue-700 lg:w-auto">Contact Us</Button>
                </Link>
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
