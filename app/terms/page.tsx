import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { ArchiveX, BadgeCheck, CreditCard, FileText, KeyRound, Lock, Scale, ShieldCheck } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Terms of Service | Karibu VMS",
  description: "Read the Karibu VMS terms covering account use, visitor records, retention, anonymisation, billing, acceptable use, service availability, and support.",
  path: "/terms",
});

const terms = [
  {
    title: "Using Karibu VMS",
    description: "Karibu VMS provides digital visitor management tools for check-in, QR pass verification, guard operations, checkout, reporting, billing, support, and facility administration. You agree to use the platform only for lawful visitor management and related business purposes.",
    icon: FileText,
  },
  {
    title: "Accounts and responsibility",
    description: "Facility admins are responsible for maintaining accurate workspace information, managing user access, protecting login credentials, reviewing guard permissions, and ensuring guards or staff use the platform appropriately.",
    icon: Lock,
  },
  {
    title: "Visitor and facility data",
    description: "Your organization is responsible for the visitor information it collects, the notices it gives visitors, the lawful reason for collecting it, the fields it enables, and the retention period it chooses. Karibu VMS provides the system used to store and manage those records.",
    icon: ShieldCheck,
  },
  {
    title: "Restricted visitors and security decisions",
    description: "Restricted visitor records and entry decisions are controlled by the facility. The platform may help compare provided identifiers such as phone, ID or passport number, or vehicle registration, but the facility remains responsible for confirming identity, applying fair procedures, and complying with applicable law.",
    icon: KeyRound,
  },
  {
    title: "Retention, anonymisation, and deletion",
    description: "Admins may use retention or anonymisation tools to remove personal visitor details from checked-out records while keeping non-sensitive operational history, audit logs, and billing usage where needed. Deleting or anonymising visitor personal data does not automatically remove billing, payment, restricted visitor, or audit records.",
    icon: ArchiveX,
  },
  {
    title: "Plans and billing",
    description: "Billing may be based on the selected plan, included visitor limits, extra visitor rates, payment status, and any custom agreement. Visitor usage may be counted separately from visitor personal records, so anonymising or deleting personal visitor details does not remove already-recorded usage or payment obligations.",
    icon: CreditCard,
  },
  {
    title: "Acceptable use",
    description: "You may not use Karibu VMS to break the law, abuse the service, attempt unauthorized access, upload harmful content, interfere with other workspaces, or misuse visitor data.",
    icon: BadgeCheck,
  },
  {
    title: "Service changes",
    description: "We may improve, update, suspend, or modify parts of the service as needed for security, reliability, compliance, or product development. We aim to keep essential workflows available and communicate major changes where practical.",
    icon: Scale,
  },
];

const summaryPoints = [
  "Use the platform only for lawful visitor management and related business operations.",
  "Facilities remain responsible for their visitor data choices, notices, users, and retention settings.",
  "Billing, audit, and operational records may be handled separately from visitor personal data.",
];

export default function TermsPage() {
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
                  <Scale className="h-4 w-4" aria-hidden="true" />
                  Terms of Service
                </div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">Terms for using Karibu VMS.</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                  These terms describe the basic rules for using Karibu VMS as a visitor management, guard workflow, billing, privacy management, and facility administration platform.
                </p>
                <p className="mt-6 text-sm font-semibold text-zinc-500">Last updated: May 28, 2026</p>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/10">
                <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Terms summary</p>
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
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Terms details</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Rules for accounts, visitor records, billing, and responsible use.</h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600">
                These terms explain how organizations should use Karibu VMS and what responsibilities remain with the facility using the workspace.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {terms.map((term) => {
                const Icon = term.icon;
                return (
                  <article key={term.title} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-zinc-950">{term.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-zinc-600">{term.description}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-950 md:text-3xl">Questions about these terms?</h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-700">
                    Contact the Karibu VMS team if you need clarification about service use, billing, account setup, visitor data, retention settings, anonymisation, or facility responsibilities.
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
