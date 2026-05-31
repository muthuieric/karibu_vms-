import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, CheckCircle2, ExternalLink, HelpCircle } from "lucide-react";

export type SeoLandingPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  primaryKeyword: string;
  audience: string;
  problemTitle: string;
  problemText: string;
  benefits: string[];
  useCases: { title: string; description: string }[];
  internalLinks: { href: string; label: string; description: string }[];
  faqs: { question: string; answer: string }[];
};

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const visitorFlow = [
  "Visitor checks in",
  "Guard verifies details",
  "Host or admin approves",
  "Visitor checks out",
];

const howItWorks = [
  {
    title: "Set your visitor rules",
    description: "Choose the details your Kenya facility needs at reception, the gate, or a QR check-in point.",
  },
  {
    title: "Register and verify visitors",
    description: "Guards capture walk-ins, review submitted details, and confirm the right host, department, or purpose.",
  },
  {
    title: "Keep records organized",
    description: "Admins can review searchable visitor history, active visits, checkout status, and operational records.",
  },
];

export default function SeoLandingPage({ content }: { content: SeoLandingPageContent }) {
  const relatedLinks = content.internalLinks.slice(0, 3);

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
                  Built for Kenya
                </div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">{content.eyebrow}</p>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">{content.title}</h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 md:text-xl">{content.intro}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="h-12 w-full rounded-xl bg-blue-600 px-7 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:w-auto">
                      Book a Demo
                    </Button>
                  </a>
                  <Link href="/features" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-zinc-200 bg-white px-7 font-bold text-zinc-800 hover:bg-zinc-50 sm:w-auto">
                      View Features
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/10">
                <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                  <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                    <div>
                      <p className="text-sm font-black text-zinc-950">Karibu VMS visitor flow</p>
                      <p className="mt-1 text-sm text-zinc-500">Designed for {content.audience.toLowerCase()}.</p>
                    </div>
            
                  </div>

                  <div className="mt-6 space-y-3">
                    {visitorFlow.map((step, index) => (
                      <div key={step} className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">
                          {String(index + 1).padStart(2, "0")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-zinc-900">{step}</p>
                          <p className="mt-1 text-xs text-zinc-500">Clear status from arrival to checkout.</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-900">
                    QR check-in, guard review, host approval, verification-friendly workflows, and searchable Kenya visitor records.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">The problem</p>
                <h2 className="mb-5 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">{content.problemTitle}</h2>
                <p className="text-lg leading-8 text-zinc-600">{content.problemText}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {content.benefits.slice(0, 4).map((benefit) => (
                  <div key={benefit} className="rounded-3xl border border-zinc-100 bg-zinc-50 p-5">
                    <BadgeCheck className="mb-3 h-5 w-5 text-green-600" aria-hidden="true" />
                    <p className="text-sm font-semibold leading-6 text-zinc-700">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-zinc-50 py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Benefits</p>
              <h2 className="mb-4 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">A cleaner visitor management system for Kenyan teams.</h2>
              <p className="text-lg leading-8 text-zinc-600">Karibu VMS keeps entry work practical for guards while giving admins better visibility across Nairobi and other Kenya facilities.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {content.benefits.slice(4).map((benefit) => (
                <div key={benefit} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
                  <CheckCircle2 className="mb-4 h-6 w-6 text-emerald-600" aria-hidden="true" />
                  <p className="text-sm font-semibold leading-6 text-zinc-700">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Use cases</p>
              <h2 className="mb-4 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Where Karibu VMS fits in Kenya.</h2>
              <p className="text-lg leading-8 text-zinc-600">Use Karibu VMS for reception desks, estate gates, office buildings, schools, institutions, and visitor-heavy teams that need reliable records.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {content.useCases.map((useCase) => (
                <div key={useCase.title} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <h3 className="mb-2 text-lg font-black text-zinc-950">{useCase.title}</h3>
                  <p className="text-sm leading-6 text-zinc-600">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-zinc-50 py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">How it works</p>
                <h2 className="mb-5 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Simple enough for the gate, useful enough for admin.</h2>
                <p className="text-lg leading-8 text-zinc-600">The flow supports everyday visitor management in Kenya: quick registration, guard verification, host context, QR passes, and checkout.</p>
              </div>
              <div className="grid gap-4">
                {howItWorks.map((item, index) => (
                  <div key={item.title} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="mb-2 text-lg font-black text-zinc-950">{item.title}</h3>
                        <p className="text-sm leading-6 text-zinc-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">More solutions</p>
              <h2 className="mb-4 text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Explore more Karibu VMS solutions.</h2>
              <p className="text-lg leading-8 text-zinc-600">Related pages for Kenyan organizations comparing visitor management workflows, QR entry, digital logbooks, and facility-specific use cases.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="group rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                  <h3 className="mb-2 text-lg font-black text-zinc-950 group-hover:text-blue-700">{link.label}</h3>
                  <p className="mb-4 text-sm leading-6 text-zinc-600">{link.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-black text-blue-700">
                    Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-zinc-50 py-14">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="rounded-3xl border border-zinc-100 bg-white p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div>
                  <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Helpful Kenya resources</p>
                  <h2 className="mb-3 text-2xl font-black tracking-tight text-zinc-950 md:text-3xl">Useful references for responsible digital operations.</h2>
                  <p className="text-sm leading-6 text-zinc-600">These public resources can help Kenyan organizations think about privacy and ICT context when handling visitor information.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a href="https://www.odpc.go.ke/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-zinc-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                    <span className="flex items-center gap-2 text-sm font-black text-zinc-900">ODPC Kenya <ExternalLink className="h-4 w-4" aria-hidden="true" /></span>
                  </a>
                  <a href="https://www.ca.go.ke/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-zinc-100 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40">
                    <span className="flex items-center gap-2 text-sm font-black text-zinc-900">Communications Authority <ExternalLink className="h-4 w-4" aria-hidden="true" /></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="lg:sticky lg:top-24">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  FAQs
                </div>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Common questions about {content.primaryKeyword}.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-600">
                  Quick answers for organizations comparing digital visitor logs, QR check-in, guard dashboards, visitor checkout, and record keeping.
                </p>
              </div>

              <div className="grid gap-4">
                {content.faqs.map((faq, index) => (
                  <article key={faq.question} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="text-lg font-black leading-7 text-zinc-950">{faq.question}</h3>
                        <p className="mt-3 text-sm leading-7 text-zinc-600">{faq.answer}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-20 text-white">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-100">Ready for a cleaner visitor flow?</p>
                <h2 className="mb-4 text-3xl font-black tracking-tight md:text-4xl">See Karibu VMS in action for your Kenya facility.</h2>
                <p className="max-w-2xl leading-7 text-white/90">Book a demo to review check-in, guard approval, QR visitor passes, checkout, and records for your Nairobi or Kenya-wide operations.</p>
              </div>
              <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                <Button className="h-12 w-full rounded-xl bg-white px-7 font-bold text-blue-600 hover:bg-zinc-50 md:w-auto">
                  Book a Demo
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
      <LazySmartChatbot />
    </div>
  );
}
