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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karibu VMS",
    description: "Enterprise Visitor Management System",
    images: ["/og-image.png"],
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
        className={`${inter.variable} ${geistMono.variable} bg-background text-text-main antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
