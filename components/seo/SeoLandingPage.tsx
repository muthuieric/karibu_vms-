import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ExternalLink, MapPin, QrCode, ShieldCheck, UserCheck } from "lucide-react";

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
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 py-24 md:py-28 max-w-6xl">
            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold mb-6 shadow-sm">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                  Built for Kenya
                </div>
                <p className="text-sm font-semibold text-blue-700 mb-3">{content.eyebrow}</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-950">{content.title}</h1>
                <p className="text-lg md:text-xl text-zinc-600 leading-relaxed mb-8 max-w-3xl">{content.intro}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl font-bold">
                      Book a Demo
                    </Button>
                  </a>
                  <Link href="/features">
                    <Button variant="outline" className="w-full sm:w-auto bg-white border-zinc-200 h-12 px-7 rounded-xl font-bold">
                      View Features
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/60">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div>
                    <p className="text-sm font-bold text-zinc-950">Karibu VMS visitor flow</p>
                    <p className="text-sm text-zinc-500 mt-1">Designed for {content.audience.toLowerCase()}.</p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <UserCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {visitorFlow.map((step, index) => (
                    <div key={step} className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-zinc-950 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1 border-b border-zinc-100 pb-4">
                        <p className="text-sm font-semibold text-zinc-900">{step}</p>
                        <p className="text-xs text-zinc-500 mt-1">Clear status from arrival to checkout.</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                  QR check-in, guard review, host approval, OTP-friendly workflows, and searchable Kenya visitor records.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">The problem</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">{content.problemTitle}</h2>
                <p className="text-lg text-zinc-600 leading-relaxed">{content.problemText}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {content.benefits.slice(0, 4).map((benefit) => (
                  <div key={benefit} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                    <BadgeCheck className="h-5 w-5 text-blue-600 mb-3" aria-hidden="true" />
                    <p className="text-sm font-semibold text-zinc-700 leading-relaxed">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl mb-12">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Benefits</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">A cleaner visitor management system for Kenyan teams.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">Karibu VMS keeps entry work practical for guards while giving admins better visibility across Nairobi and other Kenya facilities.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {content.benefits.slice(4).map((benefit) => (
                <div key={benefit} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mb-4" aria-hidden="true" />
                  <p className="text-sm font-semibold text-zinc-700 leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl mb-12">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Use cases</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Where Karibu VMS fits in Kenya.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">Use Karibu VMS for reception desks, estate gates, office buildings, schools, institutions, and visitor-heavy teams that need reliable records.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {content.useCases.map((useCase) => (
                <div key={useCase.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                  <Building2 className="h-6 w-6 text-blue-600 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">How it works</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Simple enough for the gate, useful enough for admin.</h2>
                <p className="text-lg text-zinc-600 leading-relaxed">The flow supports everyday visitor management in Kenya: quick registration, guard verification, host context, QR passes, and checkout.</p>
              </div>
              <div className="grid gap-4">
                {howItWorks.map((item, index) => (
                  <div key={item.title} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-9 w-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        <p className="text-sm text-zinc-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl mb-12">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">More solutions</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Explore more Karibu VMS solutions.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">Related pages for Kenyan organizations comparing visitor management workflows, QR entry, digital logbooks, and facility-specific use cases.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href} className="group rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                  <QrCode className="h-6 w-6 text-blue-600 mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-bold mb-2 group-hover:text-blue-700">{link.label}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-4">{link.description}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-700">
                    Learn more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="rounded-3xl border border-zinc-100 bg-white p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                <div>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Helpful Kenya resources</p>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">Useful references for responsible digital operations.</h2>
                  <p className="text-sm text-zinc-600 leading-relaxed">These public resources can help Kenyan organizations think about privacy and ICT context when handling visitor information.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a href="https://www.odpc.go.ke/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-zinc-100 p-4 hover:border-blue-200 transition-colors">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mb-3" aria-hidden="true" />
                    <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">ODPC Kenya <ExternalLink className="h-4 w-4" aria-hidden="true" /></span>
                  </a>
                  <a href="https://www.ca.go.ke/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-zinc-100 p-4 hover:border-blue-200 transition-colors">
                    <QrCode className="h-5 w-5 text-blue-600 mb-3" aria-hidden="true" />
                    <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">Communications Authority <ExternalLink className="h-4 w-4" aria-hidden="true" /></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">FAQs</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Common questions about {content.primaryKeyword}.</h2>
              </div>
              <div className="grid gap-4">
                {content.faqs.map((faq) => (
                  <div key={faq.question} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-zinc-950 text-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-bold text-blue-300 uppercase tracking-wide mb-3">Ready for a cleaner visitor flow?</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">See Karibu VMS in action for your Kenya facility.</h2>
                <p className="text-zinc-300 leading-relaxed max-w-2xl">Book a demo to review check-in, guard approval, QR visitor passes, checkout, and records for your Nairobi or Kenya-wide operations.</p>
              </div>
              <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl font-bold">
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
