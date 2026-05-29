import type { Metadata } from "next";
import Script from "next/script";
import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { nairobiVisitorManagementContent } from "@/lib/seo/landing-pages";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "Visitor Management System Nairobi | Karibu VMS",
  description: "Karibu VMS is a visitor management system for Nairobi offices, apartments, schools, CBD buildings, Westlands facilities, QR check-in, guards, and checkout.",
  path: "/visitor-management-system-nairobi",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: nairobiVisitorManagementContent.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function VisitorManagementSystemNairobiPage() {
  return (
    <>
      <Script id="visitor-management-system-nairobi-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SeoLandingPage content={nairobiVisitorManagementContent} />
    </>
  );
}
