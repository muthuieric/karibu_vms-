import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Phone, ShieldCheck } from "lucide-react";

const footerLinkGroups = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/why-us", label: "Why Karibu VMS" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/visitor-management-system-kenya", label: "Visitor Management Kenya" },
      { href: "/visitor-management-system-nairobi", label: "Visitor Management Nairobi" },
      { href: "/digital-visitor-logbook-kenya", label: "Digital Visitor Logbook" },
      { href: "/qr-code-visitor-management-system", label: "QR Code Visitor Management" },
      { href: "/visitor-management-for-office-buildings", label: "Office Building Visitors" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/login", label: "Sign In" },
    ],
  },
];

const trustPoints = [
  "Digital visitor check-in",
  "Guard and admin workflows",
  "QR visitor pass support",
];

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-100 bg-white">
      <div className="container mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <Link href="/" className="inline-flex items-center" aria-label="Karibu VMS home">
              <Image
                src="/logo.svg"
                alt="Karibu VMS visitor management system Kenya logo"
                width={128}
                height={42}
                className="h-10 w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-600">
              Karibu VMS helps teams across Kenya manage visitor check-in, guard review, QR visitor flows, checkout, and searchable records from one clean platform.
            </p>

            <div className="mt-6 grid gap-2">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm font-medium text-zinc-700">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_1.2fr]">
            {footerLinkGroups.map((group) => (
              <nav key={group.title} aria-label={`${group.title} footer links`}>
                <h2 className="mb-4 text-sm font-black text-zinc-950">{group.title}</h2>
                <div className="grid gap-3 text-sm text-zinc-600">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="transition-colors hover:text-blue-700">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </nav>
            ))}

            <div>
              <h2 className="mb-4 text-sm font-black text-zinc-950">Contact</h2>
              <div className="space-y-3 text-sm text-zinc-600">
                <a href="tel:+254702104690" className="flex items-center gap-3 font-semibold text-zinc-800 transition-colors hover:text-blue-700">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="whitespace-nowrap">+254 702 104 690</span>
                </a>

                <Link href="/contact" className="flex items-center gap-3 font-semibold text-zinc-800 transition-colors hover:text-blue-700">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span>Contact page</span>
                </Link>

                <p className="pt-2 leading-6 text-zinc-500">
                  Serving offices, apartments, schools, Airbnbs, and organizations across Kenya.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-100 pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-zinc-500">&copy; {currentYear} Karibu VMS. All rights reserved.</p>
            <p className="text-sm text-zinc-500">Visitor management system for Kenyan facilities.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
