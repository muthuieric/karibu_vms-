import React from "react";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="bg-white py-12 border-t border-zinc-100">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
           <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
           </div>
           <span className="text-lg font-bold tracking-tight text-zinc-900">karibu-vms</span>
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
          &copy; {new Date().getFullYear()} karibu-vms.
        </p>
      </div>
    </footer>
  );
}
