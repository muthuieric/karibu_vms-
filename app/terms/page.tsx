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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="py-24 bg-zinc-950 text-white border-b border-zinc-800">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-zinc-200 text-xs font-semibold mb-6">
              Terms of Service
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Terms for using Karibu VMS.</h1>
            <p className="text-lg text-zinc-300 leading-relaxed">
              These terms describe the basic rules for using Karibu VMS as a visitor management, guard workflow, billing, privacy management, and facility administration platform.
            </p>
            <p className="text-sm text-zinc-400 mt-6">Last updated: May 28, 2026</p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="grid gap-6">
              {terms.map((term) => {
                const Icon = term.icon;
                return (
                  <div key={term.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-2">{term.title}</h2>
                        <p className="text-sm text-zinc-600 leading-relaxed">{term.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-3xl border border-zinc-100 bg-zinc-50 p-6 md:p-8">
              <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-2">Questions about these terms?</h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Contact the Karibu VMS team if you need clarification about service use, billing, account setup, visitor data, retention settings, anonymisation, or facility responsibilities.
                  </p>
                </div>
                <Link href="/contact">
                  <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl">Contact Us</Button>
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
