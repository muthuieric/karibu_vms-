import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

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

const contactItems = [
  {
    label: "Phone",
    value: "+254 702 104 690",
    href: "tel:+254702104690",
    icon: Phone,
  },
  {
    label: "Email",
    value: "karibuvms@gmail.com",
    href: "mailto:karibuvms@gmail.com",
    icon: Mail,
  },
  {
    label: "Service area",
    value: "Nairobi, Kenya",
    href: "/contact",
    icon: MapPin,
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
      <div className="container mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1.95fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Karibu VMS home">
              <Image
                src="/logo.svg"
                alt="Karibu VMS visitor management system Kenya logo"
                width={120}
                height={40}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-zinc-600">
              Karibu VMS helps Kenyan teams manage visitor check-in, guard review, QR visitor flows, checkout, and searchable records from one clean platform.
            </p>

            <div className="mt-6 grid gap-3">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm font-medium text-zinc-700">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
              <div className="grid gap-3">
                {contactItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a key={item.label} href={item.href} className="group flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">{item.label}</p>
                        <p className="mt-1 break-words text-sm font-bold text-zinc-800 group-hover:text-blue-800">{item.value}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-100 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-zinc-500">&copy; {currentYear} Karibu VMS. All rights reserved.</p>
            <p className="text-sm text-zinc-500">Serving offices, apartments, schools, and organizations across Nairobi, Kenya.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
