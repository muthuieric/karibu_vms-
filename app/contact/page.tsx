import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { BadgeCheck, MessageCircle, Phone } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Contact Karibu VMS | Book a Visitor Management Demo",
  description:
    "Contact Karibu VMS to book a visitor management system demo for offices, apartments, schools, gated facilities, and organizations in Nairobi and across Kenya.",
  path: "/contact",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const contactOptions = [
  {
    title: "Book a Demo",
    detail: "+254 702 104 690",
    description: "Share your facility type, number of gates, and current visitor flow so we can guide you on the best setup.",
    button: "Start Demo Request",
    href: demoWhatsAppUrl,
    icon: MessageCircle,
    external: true,
  },
  {
    title: "Call Sales",
    detail: "+254 702 104 690",
    description: "Call to discuss your organization, guard workflow, entry points, and the plan that fits your visitor volume.",
    button: "Call Now",
    href: "tel:+254702104690",
    icon: Phone,
    external: false,
  },
  {
    title: "Send a Message",
    detail: "Use the contact form request",
    description: "Use the demo request option to send questions about setup, features, billing, or visitor management workflows.",
    button: "Request Support",
    href: demoWhatsAppUrl,
    icon: MessageCircle,
    external: true,
  },
];

const demoSteps = [
  {
    title: "Tell us about your facility",
    description: "Share whether you manage an office, apartment, school, estate, clinic, warehouse, or another controlled entrance.",
  },
  {
    title: "Review your visitor flow",
    description: "We look at how visitors arrive, who approves them, how guards work, and whether QR check-in or verification is needed.",
  },
  {
    title: "Recommend the setup",
    description: "You get guidance on gates, guards, hosts, visitor rules, checkout, billing, and the plan that fits your visitor volume.",
  },
];

const facilityFit = [
  "Offices and receptions",
  "Apartments and gated estates",
  "Schools and institutions",
  "Clinics and service facilities",
  "Warehouses and controlled sites",
  "Organizations with guards or front-desk teams",
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-b from-blue-50 via-white to-white py-24 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" aria-hidden="true" />
          <div className="container relative z-10 mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  Contact Karibu VMS
                </div>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight text-zinc-950 md:text-5xl md:leading-tight">
                  Book a visitor management demo for your organization.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                  Talk to us about your current visitor check-in process, number of gates, guard team, host approval needs, and visitor volume. We will help you choose a setup that fits your facility.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button className="h-12 w-full rounded-xl bg-blue-600 px-7 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 sm:w-auto">Book Demo</Button>
                  </a>
                  <a href="tel:+254702104690" className="w-full sm:w-auto">
                    <Button variant="outline" className="h-12 w-full rounded-xl border-zinc-200 bg-white px-7 font-semibold text-zinc-800 hover:bg-zinc-50 sm:w-auto">Call Sales</Button>
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] border border-blue-100 bg-white p-5 shadow-2xl shadow-blue-950/10">
                <div className="rounded-[1.5rem] bg-zinc-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Quick contact</p>
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                      <p className="text-sm font-bold text-zinc-950">Phone</p>
                      <a href="tel:+254702104690" className="mt-2 block text-lg font-black text-blue-700 hover:text-blue-900">+254 702 104 690</a>
                    </div>
                    <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                      <p className="text-sm font-bold text-zinc-950">Message</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">Use the demo request button to send setup, billing, or support questions.</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-100 bg-white p-5">
                      <p className="text-sm font-bold text-zinc-950">Service area</p>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">Serving offices, apartments, schools, and organizations across Nairobi, Kenya.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-3xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">Contact options</p>
              <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Choose the easiest way to reach us.</h2>
              <p className="mt-4 text-lg leading-8 text-zinc-600">
                Whether you are comparing plans, checking features, or planning a rollout for a busy entrance, we can help you understand the best visitor management workflow.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {contactOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.title} className="flex flex-col rounded-3xl border border-zinc-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-950">{option.title}</h3>
                    <p className="mt-2 text-sm font-bold text-zinc-700">{option.detail}</p>
                    <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">{option.description}</p>
                    <Button className="mt-6 h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700" asChild>
                      <a href={option.href} target={option.external ? "_blank" : undefined} rel={option.external ? "noopener noreferrer" : undefined}>
                        {option.button}
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-100 bg-zinc-50 py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-600">What happens next</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">A short conversation can clarify the right setup.</h2>
                <p className="mt-5 text-lg leading-8 text-zinc-600">
                  You do not need to know the technical setup before contacting us. We help translate your daily visitor process into a practical system configuration.
                </p>
              </div>

              <div className="grid gap-4">
                {demoSteps.map((step, index) => (
                  <div key={step.title} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-black text-blue-700">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-zinc-950">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-8 md:p-10">
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-zinc-950 md:text-4xl">Who can use Karibu VMS?</h2>
                  <p className="mt-4 text-lg leading-8 text-zinc-700">
                    The platform is useful for any organization that receives visitors and needs cleaner records, entry control, guard accountability, or host visibility.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {facilityFit.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-zinc-700 shadow-sm">
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-20 text-white">
          <div className="container mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-5xl">Ready to discuss your visitor flow?</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/90">
              Contact sales to review your entry points, guard workflow, visitor volume, host approval needs, and the plan that fits your organization.
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
