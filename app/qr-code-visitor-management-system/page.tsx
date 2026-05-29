import type { Metadata } from "next";
import Script from "next/script";
import SeoLandingPage from "@/components/seo/SeoLandingPage";
import { qrVisitorManagementContent } from "@/lib/seo/landing-pages";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "QR Code Visitor Management System Kenya | Karibu VMS",
  description: "Use Karibu VMS as a QR code visitor management system in Kenya for QR check-in, QR visitor passes, visitor codes, guard approval, and checkout.",
  path: "/qr-code-visitor-management-system",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: qrVisitorManagementContent.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function QrCodeVisitorManagementSystemPage() {
  return (
    <>
      <Script id="qr-code-visitor-management-system-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SeoLandingPage content={qrVisitorManagementContent} />
    </>
  );
}
