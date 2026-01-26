import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Explore insights on VR development, web design, multiverse experiences, and the latest trends in digital innovation from Media4U.",
  openGraph: {
    title: "Media4U Blog",
    description: "Insights on VR development, web design, and digital innovation.",
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
