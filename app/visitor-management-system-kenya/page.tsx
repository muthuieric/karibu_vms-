import type { Metadata } from "next";
import Script from "next/script";
import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { kenyaVisitorManagementContent } from "@/lib/seo/landing-pages";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "Visitor Management System Kenya | Karibu VMS",
  description: "Karibu VMS is a visitor management system in Kenya for offices, apartments, schools, buildings, QR check-in, guard dashboards, checkout, and digital visitor logs.",
  path: "/visitor-management-system-kenya",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: kenyaVisitorManagementContent.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function VisitorManagementSystemKenyaPage() {
  return (
    <>
      <Script id="visitor-management-system-kenya-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SeoLandingPage content={kenyaVisitorManagementContent} />
    </>
  );
}
