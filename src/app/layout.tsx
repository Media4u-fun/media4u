import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { ToastProvider } from "@/components/ui/toast-provider";

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
        <ConvexClientProvider>
          <ToastProvider />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
