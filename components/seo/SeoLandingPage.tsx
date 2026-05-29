import Link from "next/link";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ExternalLink, FileSearch, MapPin, QrCode, ShieldCheck } from "lucide-react";

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

export default function SeoLandingPage({ content }: { content: SeoLandingPageContent }) {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="py-28 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600 text-xs font-semibold mb-6">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                  {content.eyebrow}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-950">{content.title}</h1>
                <p className="text-lg md:text-xl text-zinc-600 leading-relaxed mb-8">{content.intro}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 px-7 rounded-xl font-bold">
                      Book a Visitor Management Demo
                    </Button>
                  </a>
                  <Link href="/features">
                    <Button variant="outline" className="w-full sm:w-auto bg-white border-zinc-200 h-12 px-7 rounded-xl font-bold">
                      See Karibu VMS Features
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-xl">
                <p className="text-sm font-bold text-zinc-900 mb-4">SEO focus</p>
                <div className="grid gap-3">
                  {[content.primaryKeyword, content.audience, "Kenya-ready visitor records", "QR check-in and guard workflows"].map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl bg-zinc-50 border border-zinc-100 p-4">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-sm font-semibold text-zinc-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-b border-zinc-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Why it matters</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">{content.problemTitle}</h2>
                <p className="text-lg text-zinc-600 leading-relaxed">{content.problemText}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {content.benefits.map((benefit) => (
                  <div key={benefit} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5">
                    <BadgeCheck className="h-5 w-5 text-green-600 mb-3" aria-hidden="true" />
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
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Use cases in Kenya</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Where this visitor management system fits.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">Karibu VMS is built for teams that need practical visitor check-in, clearer records, and faster guard workflows across Kenyan facilities.</p>
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

        <section className="py-20 bg-white border-b border-zinc-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="max-w-3xl mb-12">
              <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Internal links</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Explore related Karibu VMS pages.</h2>
              <p className="text-lg text-zinc-600 leading-relaxed">These pages help visitors and search engines understand the Karibu VMS structure, pricing, features, and Kenya-focused use cases.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {content.internalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="group rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                  <FileSearch className="h-6 w-6 text-blue-600 mb-4" aria-hidden="true" />
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

        <section className="py-20 bg-zinc-50 border-b border-zinc-100">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
              <div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Helpful external resources</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">Useful Kenya links for responsible digital operations.</h2>
                <p className="text-lg text-zinc-600 leading-relaxed">External links should be useful and relevant. These resources help Kenyan organizations think about privacy, ICT operations, and responsible visitor data handling.</p>
              </div>
              <div className="grid gap-4">
                <a href="https://www.odpc.go.ke/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2">Office of the Data Protection Commissioner Kenya <ExternalLink className="h-4 w-4" aria-hidden="true" /></h3>
                      <p className="text-sm text-zinc-600 mt-1">A useful reference for organizations thinking about personal data and privacy in Kenya.</p>
                    </div>
                  </div>
                </a>
                <a href="https://www.ca.go.ke/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <QrCode className="h-5 w-5 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                    <div>
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2">Communications Authority of Kenya <ExternalLink className="h-4 w-4" aria-hidden="true" /></h3>
                      <p className="text-sm text-zinc-600 mt-1">A relevant public ICT resource for Kenyan digital services and communications context.</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
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
      </main>

      <PublicFooter />
      <LazySmartChatbot />
    </div>
  );
}
