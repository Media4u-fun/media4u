import { Metadata } from "next";
import PortfolioPageClient from "./PortfolioPageClient";

export const metadata: Metadata = {
  title: "Portfolio - Our Work in VR, Web Design & Digital Experiences",
  description: "Explore Media4U's portfolio of VR environments, websites, and integrated digital experiences. See how we've helped businesses create stunning immersive solutions.",
  keywords: ["portfolio", "VR projects", "web design portfolio", "digital experiences", "case studies", "client work", "VR environments", "website examples"],
  openGraph: {
    title: "Media4U Portfolio - VR & Web Design Projects",
    description: "Explore our portfolio of VR environments, websites, and integrated digital experiences.",
    type: "website",
    url: "https://media4u.fun/portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U Portfolio",
    description: "Explore our work in VR, web design, and digital experiences.",
  },
  alternates: {
    canonical: "https://media4u.fun/portfolio",
  },
};

export default function PortfolioPage() {
  return <PortfolioPageClient />;
}
