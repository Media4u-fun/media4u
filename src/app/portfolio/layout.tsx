import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Explore Media4U's portfolio of stunning websites, custom VR environments, and innovative digital solutions. See our work and get inspired.",
  openGraph: {
    title: "Media4U Portfolio",
    description: "Stunning websites, VR environments, and innovative digital solutions.",
  },
};

interface PortfolioLayoutProps {
  children: ReactNode;
}

export default function PortfolioLayout({ children }: PortfolioLayoutProps) {
  return children;
}
