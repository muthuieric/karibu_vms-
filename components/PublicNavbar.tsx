"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-6xl">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
             <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900">karibu-vms</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">About</Link>
          <Link href="/why-us" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Why Us</Link>
          <Link href="/features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Features</Link>
          <Link href="/contact" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Contact</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            Sign In
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 h-9 text-sm shadow-sm">
              Register
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 -mr-2 text-zinc-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white px-6 py-4 flex flex-col gap-4 shadow-lg">
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">About</Link>
          <Link href="/why-us" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">Why Us</Link>
          <Link href="/features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">Features</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-600 py-2 border-b border-zinc-50">Contact</Link>
          <div className="flex flex-col gap-3 mt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-medium text-zinc-600 py-2 border border-zinc-200 rounded-lg">
              Sign In
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-10 text-sm">
                Register
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}