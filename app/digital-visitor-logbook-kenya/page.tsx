import type { Metadata } from "next";
import Script from "next/script";
import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { digitalLogbookContent } from "@/lib/seo/landing-pages";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "Digital Visitor Logbook Kenya | Karibu VMS",
  description: "Replace paper visitor books with a digital visitor logbook in Kenya for guard check-in, searchable visitor records, checkout, QR passes, and admin reports.",
  path: "/digital-visitor-logbook-kenya",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: digitalLogbookContent.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function DigitalVisitorLogbookKenyaPage() {
  return (
    <>
      <Script id="digital-visitor-logbook-kenya-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SeoLandingPage content={digitalLogbookContent} />
    </>
  );
}
