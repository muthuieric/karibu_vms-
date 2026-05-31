import type { Metadata } from "next";
import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { BILLING_PLANS } from "@/lib/billing/pricing";
import { publicMetadata } from "@/lib/seo/site";
import { BadgeCheck, Building2, CheckCircle2, CreditCard, ShieldCheck, Sparkles, XCircle } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Karibu VMS Pricing | Visitor Management Plans",
  description:
    "Compare Karibu VMS pricing plans for digital visitor management, QR Pass Verification, SMS OTP Verification, digital visitor passes, guard dashboards, and checkout.",
  path: "/pricing",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const planDetails = [
  {
    key: "basic" as const,
    name: "Basic",
    description: "Best for small offices that need clean visitor records and simple guard desk registration.",
    features: ["Digital visitor records", "Guard desk registration", "QR self check-in", "Visitor form settings", "Department/team organization", "Restricted visitor list"],
    cta: "Book Demo",
  },
  {
    key: "premium" as const,
    name: "Premium",
    description: "For busier facilities that need verification, digital visitor passes, host confirmation, and higher visitor capacity.",
    features: ["Everything in Basic", "QR Pass Verification", "SMS OTP Verification", "Choose one active verification method", "Digital visitor passes", "Host confirmation", "Visitor checkout", "Advanced visitor rules"],
    cta: "Book Demo",
    featured: true,
  },
  {
    key: "custom" as const,
    name: "Custom",
    description: "For enterprise, multi-site, or specialized facilities that need a tailored visitor management setup.",
    features: ["Custom visitor volume", "Multi-site or complex gate workflows", "Tailored onboarding support", "Workflow configuration guidance", "Sales-assisted setup"],
    cta: "Book Demo",
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
  { feature: "QR Pass Verification", basic: "Not included", premium: "Included" },
  { feature: "SMS OTP Verification", basic: "Not included", premium: "Included" },
  { feature: "Choose one active verification method", basic: "Not included", premium: "Included" },
  { feature: "Digital visitor passes", basic: "Not included", premium: "Included" },
  { feature: "Host confirmation", basic: "Not included", premium: "Included" },
  { feature: "Visitor checkout", basic: "Included", premium: "Included" },
  { feature: "Advanced visitor rules", basic: "Not included", premium: "Included" },
  { feature: "Priority support", basic: "Not included", premium: "Included" },
];

function formatKes(amount: number) {
  return `KES ${amount.toLocaleString()}`;
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white py-24 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Karibu VMS pricing
              </div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">Simple visitor management plans that scale with volume.</h1>
              <p className="mt-6 text-lg leading-8 text-zinc-600">
                Choose the monthly plan that fits your facility today. Premium adds higher capacity, digital visitor passes, host confirmation, and flexible verification for busier sites.
              </p>
            </div>

            <div className="mt-16 grid gap-6 lg:grid-cols-3">
              {planDetails.map((plan) => {
                const pricing = plan.key === "custom" ? null : BILLING_PLANS[plan.key];
                return (
                  <div key={plan.name} className={`relative rounded-[2rem] border p-7 shadow-sm ${plan.featured ? "border-blue-600 bg-blue-600 text-white shadow-blue-600/20" : "border-zinc-100 bg-white"}`}>
                    {plan.featured ? <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">Popular</span> : null}

                    <div className="mb-8 pr-20">
                      <h2 className="text-2xl font-black">{plan.name}</h2>
                      <p className={`mt-3 text-sm leading-6 ${plan.featured ? "text-white/85" : "text-zinc-600"}`}>{plan.description}</p>
                    </div>

                    <div className="mb-8">
                      <p className={`mb-2 text-sm font-semibold ${plan.featured ? "text-white/80" : "text-zinc-500"}`}>Monthly base price</p>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black tracking-tight md:text-5xl">{pricing ? formatKes(pricing.basePrice) : "Custom"}</span>
                        {pricing ? <span className={`pb-2 text-sm ${plan.featured ? "text-white/70" : "text-zinc-500"}`}>/ month</span> : null}
                      </div>
                    </div>

                    <div className={`mb-8 grid gap-3 sm:grid-cols-2 ${plan.featured ? "text-white" : "text-zinc-700"}`}>
                      <div className={`rounded-2xl border p-4 ${plan.featured ? "border-white/15 bg-white/10" : "border-zinc-100 bg-zinc-50"}`}>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide opacity-75">Included visitors</p>
                        <p className="text-xl font-black">{pricing ? pricing.includedVisitors.toLocaleString() : "Custom"}</p>
                      </div>
                      <div className={`rounded-2xl border p-4 ${plan.featured ? "border-white/15 bg-white/10" : "border-zinc-100 bg-zinc-50"}`}>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide opacity-75">Extra visitor rate</p>
                        <p className="text-xl font-black">{pricing ? `${formatKes(pricing.extraVisitorRate)} each` : "Custom"}</p>
                      </div>
                    </div>

                    <div className="mb-8 grid gap-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className={`flex items-start gap-3 text-sm ${plan.featured ? "text-white/90" : "text-zinc-700"}`}>
                          <BadgeCheck className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-white" : "text-emerald-600"}`} aria-hidden="true" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                      <Button className={`h-12 w-full rounded-xl font-bold ${plan.featured ? "bg-white text-blue-700 hover:bg-zinc-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                        {plan.cta}
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Feature comparison</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Basic vs Premium</h2>
              </div>
              <p className="text-lg leading-8 text-zinc-600">
                Basic covers the core visitor management flow. Premium adds higher capacity, digital visitor passes, host confirmation, priority support, and advanced visitor rules.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <div className="min-w-[44rem]">
                  <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] bg-zinc-50 text-sm font-black text-zinc-950">
                    <div className="p-4 md:p-5">Feature</div>
                    <div className="p-4 text-center md:p-5">Basic</div>
                    <div className="p-4 text-center md:p-5">Premium</div>
                  </div>
                  {comparisonRows.map((row) => (
                    <div key={row.feature} className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-t border-zinc-100 text-sm">
                      <div className="p-4 font-medium text-zinc-800 md:p-5">{row.feature}</div>
                      <ComparisonCell value={row.basic} />
                      <ComparisonCell value={row.premium} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-zinc-50 py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Billing details</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Transparent monthly usage, with M-Pesa support.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-600">
                  Your dashboard calculates the current period, included visitors, extra visitor charges, and payment status so admins can see what is due before initiating payment.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/features" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-zinc-200 bg-white px-7 font-semibold text-zinc-800 hover:bg-zinc-50 sm:w-auto">Review Features</Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                {notes.map((note, index) => {
                  const icons = [CreditCard, ShieldCheck, BadgeCheck, Building2];
                  const Icon = icons[index] || BadgeCheck;
                  return (
                    <div key={note} className="flex items-start gap-4 rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <p className="text-sm leading-6 text-zinc-700">{note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-20 text-white">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <Sparkles className="mx-auto mb-5 h-10 w-10 text-blue-100" aria-hidden="true" />
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">Choose the plan that matches your visitor flow.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
              Start with Basic for simple visitor records or use Premium for advanced verification, higher capacity, host confirmation, and digital visitor passes.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button className="h-14 w-full rounded-xl bg-white px-8 text-base font-black text-blue-600 shadow-lg hover:bg-zinc-50 sm:w-auto">Book Demo</Button>
              </a>
              <a href="tel:+254702104690" className="text-sm font-semibold text-white/90 transition-colors hover:text-white">Call Sales: +254 702 104 690</a>
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
    <div className="flex items-center justify-center gap-2 p-4 text-center text-zinc-700 md:p-5">
      {included ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />
      )}
      <span className={included ? "font-semibold" : "text-zinc-500"}>{value}</span>
    </div>
  );
}
