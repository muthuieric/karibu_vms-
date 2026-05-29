import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
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
    default: "Karibu VMS | Visitor Management System in Kenya",
    template: "%s | Karibu VMS",
  },
  description:
    "Karibu VMS is a visitor management system in Kenya for offices, apartments, schools, QR check-in, QR visitor passes, guard dashboards, host confirmation, checkout, and digital visitor logs.",
  keywords: [
    "visitor management system Kenya",
    "visitor management system Nairobi",
    "digital visitor logbook Kenya",
    "QR code visitor management system Kenya",
    "office visitor management Kenya",
    "apartment visitor management Kenya",
    "school visitor management Kenya",
    "visitor check-in system Kenya",
    "guard visitor check-in system",
    "digital visitor pass Kenya",
    "QR visitor pass",
    "SMS OTP visitor verification",
    "visitor checkout system",
    "restricted visitor list",
    "Gate Check-in",
    "Security Access Control",
    "M-Pesa visitor management billing",
    "Karibu VMS",
  ],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  openGraph: {
    title: "Karibu VMS | Visitor Management System in Kenya",
    description:
      "A digital visitor management system in Kenya for secure check-ins, QR visitor passes, guard dashboards, host confirmation, visitor checkout, and searchable records.",
    siteName: "Karibu VMS",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Karibu VMS visitor management system in Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karibu VMS | Visitor Management System in Kenya",
    description:
      "Visitor management system in Kenya for QR check-in, guard dashboards, host confirmation, visitor checkout, and digital visitor logs.",
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
  const enableVercelInsights = Boolean(process.env.VERCEL);

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

        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}

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
