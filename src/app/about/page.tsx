import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Media4U is a web design and creative studio that builds professional websites, visual branding, and immersive VR experiences. Purpose-driven and faith-informed, we help businesses build their digital presence. Meet Mr. Harmony and Mike.",
  openGraph: {
    title: "About | Media4U",
    description:
      "Media4U is a web design and creative studio. We build professional websites first, then extend into branding and VR. Purpose-driven and faith-informed, we create meaningful digital experiences for everyone.",
  },
};

export default function AboutPage(): ReactElement {
  return <AboutContent />;
}
