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
      { href: "/contact", label: "Book a Demo" },
    ],
  },
  {
    title: "Kenya visitor management",
    links: [
      { href: "/visitor-management-system-kenya", label: "Visitor Management System Kenya" },
      { href: "/visitor-management-system-nairobi", label: "Visitor Management System Nairobi" },
      { href: "/digital-visitor-logbook-kenya", label: "Digital Visitor Logbook Kenya" },
      { href: "/qr-code-visitor-management-system", label: "QR Code Visitor Management" },
      { href: "/visitor-management-for-office-buildings", label: "Office Building Visitor Management" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer className="bg-white py-14 border-t border-zinc-100">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.9fr]">
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
            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
              Karibu VMS is a visitor management system in Kenya for digital visitor check-in, QR visitor passes, guard dashboards, checkout, and searchable records.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinkGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-bold text-zinc-900 mb-4">{group.title}</h2>
                <div className="grid gap-3 text-sm font-medium text-zinc-500">
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
          <p className="text-sm text-zinc-500">Built for visitor management workflows in Kenya.</p>
        </div>
      </div>
    </footer>
  );
}
