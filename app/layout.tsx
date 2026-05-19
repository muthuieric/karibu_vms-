import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import InstallPrompt from "@/components/InstallPrompt";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://karibuvms.com"),
  manifest: "/manifest.webmanifest",
  title: {
    default: "Karibu VMS",
    template: "%s | Karibu VMS",
  },
  description:
    "Karibu VMS is a modern visitor management system for secure visitor check-in, guard workflows, host confirmation, and building access records.",
  keywords: [
    "Visitor Management System",
    "VMS",
    "Gate Check-in",
    "Security Access Control",
    "SaaS",
    "Karibu VMS",
    "Digital Logbook",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    title: "Karibu VMS",
    description:
      "A modern visitor management system for secure visitor check-in and building access control.",
    siteName: "Karibu VMS",
    type: "website",
    images: ["/og-image.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karibu VMS",
    description:
      "A modern visitor management system for secure visitor check-in and building access control.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body
        className={`${inter.variable} ${geistMono.variable} bg-background text-text-main antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-slate-950 focus:shadow-lg"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, websiteJsonLd]) }}
        />
        {children}
        <InstallPrompt />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
