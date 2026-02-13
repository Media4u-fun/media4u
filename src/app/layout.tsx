import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider } from "@/components/AuthContext";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { QuickQuoteWidget } from "@/components/widgets/QuickQuoteWidget";

export const metadata: Metadata = {
  title: {
    default: "Media4U | VR Environments & Digital Solutions",
    template: "%s | Media4U",
  },
  description: "Custom VR environments, stunning websites, and immersive virtual experiences that connect people and inspire creativity.",
  keywords: ["VR", "virtual reality", "web design", "virtual worlds", "digital agency", "immersive experiences"],
  authors: [{ name: "Media4U" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Media4U",
    title: "Media4U | VR Environments & Digital Solutions",
    description: "Custom VR environments, stunning websites, and immersive virtual experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U | VR Environments & Digital Solutions",
    description: "Custom VR environments, stunning websites, and immersive virtual experiences.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['Organization', 'LocalBusiness'],
              name: 'Media4U',
              alternateName: 'Media4U Digital Solutions',
              url: 'https://media4u.fun',
              logo: 'https://media4u.fun/media4u-logo.png',
              description: 'Custom VR environments, stunning websites, and immersive virtual experiences that connect people and inspire creativity.',
              email: 'info@media4u.fun',
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Digital',
                addressCountry: 'US',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: '0',
                longitude: '0',
              },
              sameAs: [
                // Social media URLs - update when available
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: ['English'],
                email: 'info@media4u.fun',
              },
              areaServed: {
                '@type': 'GeoCircle',
                geoMidpoint: {
                  '@type': 'GeoCoordinates',
                  latitude: '0',
                  longitude: '0',
                },
                geoRadius: 'Global',
              },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Digital Services',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'VR Environment Development',
                      description: 'Custom virtual reality experiences and immersive environments',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Web Design & Development',
                      description: 'Professional website design and development services',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Service',
                      name: 'Immersive VR Experiences',
                      description: 'Custom virtual reality environments and experiences',
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Media4U',
              url: 'https://media4u.fun',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://media4u.fun/vr?search={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Enhanced Service Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Service',
                serviceType: 'Web Design & Development',
                provider: {
                  '@type': 'Organization',
                  name: 'Media4U',
                  url: 'https://media4u.fun',
                },
                areaServed: 'Global',
                description: 'Modern, mobile-responsive websites built for businesses, creators, and brands. From landing pages to full eCommerce - we build sites that convert.',
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'USD',
                  price: '899',
                  priceSpecification: {
                    '@type': 'PriceSpecification',
                    minPrice: '899',
                    maxPrice: '1399',
                    priceCurrency: 'USD',
                  },
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Service',
                serviceType: 'VR Development',
                provider: {
                  '@type': 'Organization',
                  name: 'Media4U',
                  url: 'https://media4u.fun',
                },
                areaServed: 'Global',
                description: 'Custom virtual reality environments, immersive storefronts, and VR experiences that bring brands into the future.',
                category: 'Virtual Reality Development',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'Service',
                serviceType: 'Branding & Design',
                provider: {
                  '@type': 'Organization',
                  name: 'Media4U',
                  url: 'https://media4u.fun',
                },
                areaServed: 'Global',
                description: 'Logos, social graphics, video assets, and promotional content that make brands stand out across web, social, and VR platforms.',
              },
            ]),
          }}
        />

        <GoogleAnalytics />
        <ConvexClientProvider>
          <AuthProvider>
            <ToastProvider />
            <LayoutWrapper>{children}</LayoutWrapper>
            <QuickQuoteWidget />
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
