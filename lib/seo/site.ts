import type { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karibuvms.com";

export const publicPages = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/visitor-management-system-kenya", priority: 0.95, changeFrequency: "weekly" as const },
  { path: "/visitor-management-system-nairobi", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/digital-visitor-logbook-kenya", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/qr-code-visitor-management-system", priority: 0.88, changeFrequency: "weekly" as const },
  { path: "/visitor-management-for-office-buildings", priority: 0.88, changeFrequency: "weekly" as const },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/why-us", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/login", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/register", priority: 0.8, changeFrequency: "monthly" as const },
];

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function publicMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: "Karibu VMS",
      type: "website",
      images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Karibu VMS visitor management system in Kenya" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.svg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const privateRouteMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Karibu VMS",
  url: siteUrl,
  logo: absoluteUrl("/logo.svg"),
  email: "karibuvms@gmail.com",
  telephone: "+254702104690",
  sameAs: [
    "https://www.karibuvms.com",
  ],
};

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Karibu VMS by Luffi Tech",
  url: siteUrl,
  logo: absoluteUrl("/logo.svg"),
  image: absoluteUrl("/og-image.svg"),
  description:
    "Karibu VMS is a visitor management system for offices, apartments, schools, gated facilities, and organizations in Nairobi and across Kenya.",
  telephone: "+254702104690",
  email: "karibuvms@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  areaServed: [
    {
      "@type": "City",
      name: "Nairobi",
    },
    {
      "@type": "Country",
      name: "Kenya",
    },
  ],
  priceRange: "KES",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Karibu VMS",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};