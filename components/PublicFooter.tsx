import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-white py-12 border-t border-zinc-100">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Karibu VMS logo"
            width={120}
            height={40}
            className="h-9 w-auto"
          />
        </Link>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-zinc-500">
          <Link href="/about" className="hover:text-zinc-900 transition-colors">About</Link>
          <Link href="/why-us" className="hover:text-zinc-900 transition-colors">Why Us</Link>
          <Link href="/features" className="hover:text-zinc-900 transition-colors">Features</Link>
          <Link href="/pricing" className="hover:text-zinc-900 transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
          <span className="text-zinc-300">|</span>
          <Link href="/privacy" className="hover:text-zinc-900 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-zinc-900 transition-colors">Terms</Link>
        </div>

        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Karibu VMS.
        </p>
      </div>
    </footer>
  );
}
