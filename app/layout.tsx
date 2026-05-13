import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Karibu VMS | Enterprise Visitor Management System",
  description: "Secure your building with Karibu VMS. The modern visitor management system featuring GPS-verified geofencing, dynamic QR codes, AI ID scanning, and instant host notifications. Replace paper logbooks with enterprise-grade security.",
  keywords: [
    "Visitor Management System",
    "VMS",
    "Gate Check-in",
    "Security Access Control",
    "SaaS",
    "Karibu VMS",
    "Digital Logbook",
  ],
  openGraph: {
    title: "Karibu VMS | Enterprise Visitor Management System",
    description: "Secure your building with Karibu VMS. The modern visitor management system featuring GPS-verified geofencing, dynamic QR codes, AI ID scanning, and instant host notifications. Replace paper logbooks with enterprise-grade security.",
    siteName: "Karibu VMS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 text-zinc-900`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
