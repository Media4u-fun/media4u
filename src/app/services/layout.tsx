import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Services - Web Design, VR Development & Digital Solutions",
  description:
    "Professional websites starting at $899, custom VR environments, and immersive digital experiences. Explore Media4U services for every budget.",
  keywords: [
    "web design services",
    "VR development",
    "website pricing",
    "virtual reality services",
    "digital agency services",
  ],
  openGraph: {
    title: "Media4U Services - Web Design, VR & Digital Solutions",
    description:
      "Professional websites starting at $899, custom VR environments, and immersive digital experiences.",
    type: "website",
    url: "https://media4u.fun/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U Services",
    description:
      "Professional websites and VR experiences for every budget.",
  },
  alternates: {
    canonical: "https://media4u.fun/services",
  },
};

interface ServicesLayoutProps {
  children: ReactNode;
}

export default function ServicesLayout({ children }: ServicesLayoutProps): ReactNode {
  return children;
}
