import type { Metadata } from "next";
import type { ReactElement } from "react";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Media4U is a creative and technology studio that builds professional websites, immersive VR experiences, and visual media that help people and businesses connect. Meet Mr. Harmony and Mike.",
  openGraph: {
    title: "About | Media4U",
    description:
      "Media4U blends web design, immersive VR, and visual storytelling. Purpose-driven and faith-informed, we build meaningful digital experiences for everyone.",
  },
};

export default function AboutPage(): ReactElement {
  return <AboutContent />;
}
