import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/pricing";
import { BadgeCheck, Building2, CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Karibu VMS Pricing | Visitor Management Plans",
  description: "Compare Karibu VMS pricing plans for digital visitor management, guard workflows, QR entry, checkout tracking, billing, and premium controls.",
  alternates: { canonical: "/pricing" },
};

const planDetails = [
  {
    key: "basic" as const,
    name: "Basic",
    description: "Best for small offices that need clean visitor records and simple guard desk registration.",
    features: ["Digital visitor records", "Guard desk registration", "QR self check-in", "Visitor form settings","Department/team organization", "Restricted visitor list"],
    cta: "Start Basic",
  },
  {
    key: "premium" as const,
    name: "Premium",
    description: "Best for busy buildings and organizations that need more visitor capacity and stronger workflows.",
    features: ["Everything in Basic","OTP phone verification for visitor check-in", "Host email confirmation", "Photo and location controls", "Priority support"],
    cta: "Start Premium",
    featured: true,
  },
  {
    key: "custom" as const,
    name: "Custom",
    description: "For enterprise, multi-site, or specialized facilities that need a tailored visitor management setup.",
    features: ["Custom visitor volume", "Multi-site or complex gate workflows", "Tailored onboarding support", "Workflow configuration guidance", "Sales-assisted setup"],
    cta: "Contact Sales",
  },
];

const notes = [
  "Plans are billed monthly in Kenyan shillings.",
  "Extra visitors are charged only after the included monthly allowance is used.",
  "M-Pesa payment initiation and transaction history are available from the billing dashboard.",
  "Setup needs such as one reception point, multiple gates, or host routing can be discussed with the sales team.",
];

const comparisonRows = [
  { feature: "Digital visitor records", basic: "Included", premium: "Included" },
  { feature: "Guard desk registration", basic: "Included", premium: "Included" },
  { feature: "QR self check-in", basic: "Included", premium: "Included" },
  { feature: "Visitor form settings", basic: "Included", premium: "Included" },
  { feature: "Restricted visitor list", basic: "Included", premium: "Included" },
  { feature: "Department/team organization", basic: "Included", premium: "Included" },
  { feature: "Custom questions", basic: "Included", premium: "Included" },
  { feature: "Host selection and routing", basic: "Basic", premium: "Included" },
  { feature: "Up to 500 visitors/month", basic: "Included", premium: "Included" },
  { feature: "Extra visitors at KES 2 each", basic: "Included", premium: "Not included" },
  { feature: "Up to 1,000 visitors/month", basic: "Not included", premium: "Included" },
  { feature: "Extra visitors at KES 3 each", basic: "Not included", premium: "Included" },
  { feature: "Host email confirmation", basic: "Not included", premium: "Included" },
  { feature: "Advanced visitor rules", basic: "Not included", premium: "Included" },
  { feature: "Priority support", basic: "Not included", premium: "Included" },
  { feature: "OTP phone verification", basic: "Not included", premium: "Included" },

];

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        <section className="py-28 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-6">
                Pricing
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-6 tracking-tight">Simple plans that scale with visitor volume.</h1>
              <p className="text-lg text-zinc-600 leading-relaxed">
                Choose the monthly plan that fits your facility today. Each plan includes a visitor allowance, then usage-based charges apply only for extra visitors.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mt-16">
              {planDetails.map((plan) => {
                const pricing = plan.key === "custom" ? null : BILLING_PLANS[plan.key];
                return (
                  <div key={plan.name} className={`rounded-3xl border p-7 md:p-8 shadow-sm ${plan.featured ? "bg-zinc-950 text-white border-zinc-900" : "bg-white border-zinc-100"}`}>
                    <div className="flex items-start justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                        <p className={`text-sm leading-relaxed ${plan.featured ? "text-zinc-300" : "text-zinc-600"}`}>{plan.description}</p>
                      </div>
                      {plan.featured && <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-bold text-white">Popular</span>}
                    </div>

                    <div className="mb-8">
                      <p className={`text-sm font-semibold mb-2 ${plan.featured ? "text-zinc-300" : "text-zinc-500"}`}>Monthly base price</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{pricing ? formatKes(pricing.basePrice) : "Custom"}</span>
                        {pricing && <span className={`text-sm pb-2 ${plan.featured ? "text-zinc-400" : "text-zinc-500"}`}>/ month</span>}
                      </div>
                    </div>

                    <div className={`grid sm:grid-cols-2 gap-3 mb-8 ${plan.featured ? "text-zinc-200" : "text-zinc-700"}`}>
                      <div className={`rounded-2xl p-4 ${plan.featured ? "bg-white/5 border border-white/10" : "bg-zinc-50 border border-zinc-100"}`}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1">Included visitors</p>
                        <p className="text-xl font-bold">{pricing ? pricing.includedVisitors.toLocaleString() : "Custom"}</p>
                      </div>
                      <div className={`rounded-2xl p-4 ${plan.featured ? "bg-white/5 border border-white/10" : "bg-zinc-50 border border-zinc-100"}`}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1">Extra visitor rate</p>
                        <p className="text-xl font-bold">{pricing ? `${formatKes(pricing.extraVisitorRate)} each` : "Custom"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 mb-8">
                      {plan.features.map((feature) => (
                        <div key={feature} className={`flex items-start gap-3 text-sm ${plan.featured ? "text-zinc-200" : "text-zinc-700"}`}>
                          <BadgeCheck className="w-4 h-4 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href={plan.key === "custom" ? "/contact" : `/register?plan=${plan.key}`}>
                      <Button className={`w-full h-12 rounded-xl font-bold ${plan.featured ? "bg-white text-zinc-950 hover:bg-zinc-100" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white border-b border-zinc-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl mb-12">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Feature comparison</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Basic vs Premium</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">
                Basic covers the core visitor management flow. Premium adds higher capacity and stronger workflows for busy buildings and larger organizations.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[44rem]">
                  <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] bg-zinc-50 text-sm font-bold text-zinc-900">
                    <div className="p-4 md:p-5">Feature</div>
                    <div className="p-4 md:p-5 text-center">Basic</div>
                    <div className="p-4 md:p-5 text-center">Premium</div>
                  </div>
                  {comparisonRows.map((row) => (
                    <div key={row.feature} className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-t border-zinc-100 text-sm">
                      <div className="p-4 md:p-5 font-medium text-zinc-800">{row.feature}</div>
                      <ComparisonCell value={row.basic} />
                      <ComparisonCell value={row.premium} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-zinc-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-14 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Billing details</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Transparent monthly usage, with M-Pesa support.</h2>
                <p className="text-lg text-zinc-600 leading-relaxed">
                  Your dashboard calculates the current period, included visitors, extra visitor charges, and payment status so admins can see what is due before initiating payment.
                </p>
              </div>

              <div className="grid gap-4">
                {notes.map((note, index) => {
                  const icons = [CreditCard, ShieldCheck, BadgeCheck, Building2];
                  const Icon = icons[index] || BadgeCheck;
                  return (
                    <div key={note} className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                      <div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <p className="text-sm text-zinc-700 leading-relaxed">{note}</p>
                    </div>
                  );
                })}
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

function ComparisonCell({ value }: { value: string }) {
  const included = value !== "Not included";

  return (
    <div className="flex items-center justify-center gap-2 p-4 md:p-5 text-center text-zinc-700">
      {included ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
      )}
      <span className={included ? "font-semibold" : "text-zinc-500"}>{value}</span>
    </div>
  );
}
