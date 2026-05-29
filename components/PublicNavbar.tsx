"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const demoWhatsAppUrl = "https://wa.me/254702104690?text=Hi%20Karibu%20VMS%2C%20I%20would%20like%20to%20book%20a%20demo%20for%20my%20organization.";

const seoLinks = [
  { href: "/visitor-management-system-kenya", label: "VMS Kenya" },
  { href: "/digital-visitor-logbook-kenya", label: "Digital Logbook" },
  { href: "/visitor-management-system-nairobi", label: "VMS Nairobi" },
];

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Karibu VMS visitor management system Kenya logo"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link href="/about" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">About</Link>
            <Link href="/why-us" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Why Karibu VMS</Link>
            <Link href="/features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Pricing</Link>
            <Link href="/contact" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Contact</Link>
          </nav>

          <div className="hidden xl:flex items-center gap-4 border-l border-zinc-100 pl-4">
            {seoLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Sign In
            </Link>
            <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 h-9 text-sm shadow-sm">
                Book Visitor Management Demo
              </Button>
            </a>
          </div>

          <button 
            className="md:hidden p-2 -mr-2 text-zinc-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-controls="public-mobile-menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav id="public-mobile-menu" className="md:hidden border-t border-zinc-100 bg-white px-6 py-4 flex flex-col gap-4 shadow-lg" aria-label="Mobile navigation">
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">About</Link>
            <Link href="/why-us" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">Why Karibu VMS</Link>
            <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">Features</Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">Pricing</Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">Contact</Link>
            {seoLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold text-blue-700 py-2 border-b border-zinc-50">
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 mt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-medium text-zinc-600 py-2 border border-zinc-200 rounded-lg">
                Sign In
              </Link>
              <a href={demoWhatsAppUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 text-sm">
                  Book Visitor Management Demo
                </Button>
              </a>
            </div>
          </nav>
        )}
      </header>
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
