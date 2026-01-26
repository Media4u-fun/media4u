import type { Metadata } from "next";
import { ContactPageContent } from "./contact-page-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Media4U for custom VR environments, web design, and multiverse experiences. We're here to bring your digital vision to life.",
  openGraph: {
    title: "Contact Media4U",
    description: "Get in touch with Media4U for custom VR environments and digital solutions.",
  },
};

export default function ContactPage() {
  return (
    <>
      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Media4U',
            description: 'VR Development and Digital Solutions Agency',
            url: 'https://media4u.com',
            priceRange: '$$',
          }),
        }}
      />

      <ContactPageContent />
    </>
  );
}
