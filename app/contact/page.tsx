import type { Metadata } from "next";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import LazySmartChatbot from "@/components/LazySmartChatbot";
import { Button } from "@/components/ui/button";
import { publicMetadata } from "@/lib/seo/site";
import { Mail, MessageCircle, Phone } from "lucide-react";

export const metadata: Metadata = publicMetadata({
  title: "Book a Demo | Karibu VMS",
  description: "Book a Karibu VMS demo on WhatsApp or contact sales for a visitor management system for offices, apartments, schools, and gated facilities.",
  path: "/contact",
});

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const contactOptions = [
  {
    title: "WhatsApp Sales",
    detail: "+254 702 104 690",
    button: "Book Demo on WhatsApp",
    href: demoWhatsAppUrl,
    icon: MessageCircle,
    tone: "bg-green-50 text-green-700",
    external: true,
  },
  {
    title: "Email Support",
    detail: "karibuvms@gmail.com",
    button: "Send Email",
    href: "mailto:karibuvms@gmail.com",
    icon: Mail,
    tone: "bg-blue-50 text-blue-700",
    external: false,
  },
  {
    title: "Call Sales",
    detail: "+254 702 104 690",
    button: "Call Now",
    href: "tel:+254702104690",
    icon: Phone,
    tone: "bg-orange-50 text-orange-700",
    external: false,
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-zinc-50 font-sans text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <PublicNavbar />

      <main id="main-content" className="flex-1">
        <section className="border-b border-zinc-100 py-28">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-600">
                Contact Karibu VMS
              </div>
              <h1 className="mb-5 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
                Book a demo for your organization.
              </h1>
              <p className="text-lg leading-relaxed text-zinc-600">
                WhatsApp is the fastest way to schedule a Karibu VMS demo. You can also call sales or email support for help with office visitor management, apartment visitor management, school visitor management, or gated facility setup.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {contactOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.title} className="rounded-3xl border border-zinc-100 bg-white p-6 text-center shadow-sm">
                    <div className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${option.tone}`}>
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900">{option.title}</h2>
                    <p className="mt-2 text-sm font-semibold text-zinc-600">{option.detail}</p>
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
      </main>

      <PublicFooter />
      <LazySmartChatbot />
    </div>
  );
}
