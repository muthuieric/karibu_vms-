import React from "react";
import Image from "next/image";
import Link from "next/link";

const footerLinkGroups = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/why-us", label: "Why Karibu VMS" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { href: "/visitor-management-system-kenya", label: "Visitor Management System Kenya" },
      { href: "/digital-visitor-logbook-kenya", label: "Digital Visitor Logbook Kenya" },
      { href: "/qr-code-visitor-management-system", label: "QR Code Visitor Management" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="bg-white py-16 border-t border-zinc-100">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1.85fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Karibu VMS visitor management system Kenya logo"
                width={120}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-500">
              Karibu VMS helps Kenyan teams manage visitor check-in, QR passes, guard workflows, checkout, and searchable records from one clean platform.
            </p>
            <div className="mt-5 grid gap-2 text-sm leading-6 text-zinc-500">
              <p>Karibu VMS by Luffi Tech</p>
              <p>Serving offices, apartments, schools, and organizations across Nairobi, Kenya.</p>
              <p>
                Phone: <a className="font-medium text-zinc-700 hover:text-zinc-950" href="tel:+254702104690">+254 702 104 690</a>
              </p>
              <p>
                Email: <a className="font-medium text-zinc-700 hover:text-zinc-950" href="mailto:karibuvms@gmail.com">karibuvms@gmail.com</a>
              </p>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerLinkGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold text-zinc-950 mb-4">{group.title}</h2>
                <div className="grid gap-3 text-sm text-zinc-500">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:text-zinc-900 transition-colors">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-100 pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Karibu VMS.
          </p>
          <p className="text-sm text-zinc-500">Built for visitor management workflows in Kenya and Nairobi.</p>
        </div>
      </div>
    </footer>
  );
}