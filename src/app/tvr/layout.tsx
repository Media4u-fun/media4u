import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Tri Virtual Roundtable | Faith, Culture & Technology",
    template: "%s | Tri Virtual Roundtable",
  },
  description: "A future-focused, faith-driven podcast where truth, faith, culture, and technology meet. Hosted by MrHarmony, Iceman, and Doc Maasi.",
  keywords: ["podcast", "faith", "technology", "virtual roundtable", "community service", "H.E.A.R.T."],
  authors: [{ name: "Tri Virtual Roundtable" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tri Virtual Roundtable",
    title: "Tri Virtual Roundtable | Faith, Culture & Technology",
    description: "A future-focused, faith-driven podcast where truth, faith, culture, and technology meet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tri Virtual Roundtable | Faith, Culture & Technology",
    description: "A future-focused, faith-driven podcast where truth, faith, culture, and technology meet.",
  },
};

export default function TVRLayout({ children }: { children: ReactNode }) {
  return (
    <div className="tvr-site">
      {children}
    </div>
  );
}
