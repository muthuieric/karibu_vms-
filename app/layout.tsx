import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: "Karibu VMS | Enterprise Visitor Management System",
  description: "Secure your building with Karibu VMS. The modern visitor management system featuring GPS-verified geofencing, dynamic QR codes, manual ID capture, and instant host notifications. Replace paper logbooks with enterprise-grade security.",
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
    description: "Secure your building with Karibu VMS. The modern visitor management system featuring GPS-verified geofencing, dynamic QR codes, manual ID capture, and instant host notifications. Replace paper logbooks with enterprise-grade security.",
    siteName: "Karibu VMS",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Karibu VMS",
    description: "Enterprise Visitor Management System",
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
  const enableVercelInsights = Boolean(process.env.VERCEL);

  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${geistMono.variable} bg-background text-text-main antialiased`}
      >
        {children}
        {enableVercelInsights && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
