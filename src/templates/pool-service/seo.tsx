// SEO meta tags component for pool service template.
// Used in the page's metadata export (server-side), not as a rendered component.
// Import this in the page.tsx that renders the template.

import type { Metadata } from "next";

interface SeoConfig {
  businessName: string;
  tagline: string;
  description: string;
  phone: string;
  address: string;
  industry: string;
  slug: string;
  domain?: string;
}

export function generatePoolServiceMetadata(config: SeoConfig): Metadata {
  const title = `${config.businessName} - ${config.tagline}`;
  const description = config.description;
  const url = config.domain
    ? `https://${config.domain}`
    : `https://media4u.com/s/${config.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: config.businessName,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: url,
    },
  };
}
