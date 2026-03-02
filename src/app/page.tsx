import { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Media4U | Professional Websites & Immersive VR Experiences",
  description:
    "Custom websites that convert and VR environments that captivate. From landing pages to virtual worlds, Media4U builds digital experiences that perform.",
  keywords: [
    "web design",
    "VR development",
    "virtual reality",
    "website builder",
    "immersive experiences",
    "digital agency",
    "custom websites",
  ],
  openGraph: {
    title: "Media4U | Professional Websites & Immersive VR Experiences",
    description:
      "Custom websites that convert and VR environments that captivate.",
    type: "website",
    url: "https://media4u.fun",
    images: [
      {
        url: "https://media4u.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "Media4U - Professional Websites & Immersive VR Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U | Websites & VR Experiences",
    description:
      "Custom websites that convert and VR environments that captivate.",
    images: ["https://media4u.fun/og-image.png"],
  },
  alternates: {
    canonical: "https://media4u.fun",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
