import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { AuthProvider } from "@/components/AuthContext";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

export const metadata: Metadata = {
  title: {
    default: "Media4U | VR Environments & Digital Solutions",
    template: "%s | Media4U",
  },
  description: "Custom VR environments, stunning websites, and innovative multiverse experiences that connect people and inspire creativity.",
  keywords: ["VR", "virtual reality", "web design", "multiverse", "digital agency", "immersive experiences"],
  authors: [{ name: "Media4U" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Media4U",
    title: "Media4U | VR Environments & Digital Solutions",
    description: "Custom VR environments, stunning websites, and innovative multiverse experiences.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U | VR Environments & Digital Solutions",
    description: "Custom VR environments, stunning websites, and innovative multiverse experiences.",
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
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Media4U',
              url: 'https://media4u.fun',
              logo: 'https://media4u.fun/media4u-logo.png',
              description: 'Custom VR environments, stunning websites, and innovative multiverse experiences that connect people and inspire creativity.',
              sameAs: [
                // Add social media URLs when available
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: 'English',
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

        <ConvexClientProvider>
          <AuthProvider>
            <ToastProvider />
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
