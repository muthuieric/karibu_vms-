import type { Metadata } from "next";
import Script from "next/script";
import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { officeBuildingContent } from "@/lib/seo/landing-pages";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "Office Building Visitor Management Kenya | Karibu VMS",
  description: "Karibu VMS helps office buildings in Kenya manage reception visitors, tenants, hosts, guards, departments, QR passes, visitor checkout, and records.",
  path: "/visitor-management-for-office-buildings",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: officeBuildingContent.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function VisitorManagementForOfficeBuildingsPage() {
  return (
    <>
      <Script id="visitor-management-for-office-buildings-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SeoLandingPage content={officeBuildingContent} />
    </>
  );
}
