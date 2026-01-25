import type { Metadata } from "next";
import type { ReactElement } from "react";
import { StartProjectContent } from "./start-project-content";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Start your Media4U project. View web design packages starting at $899, explore VR options, and submit a project request. No pressure—just a conversation.",
  openGraph: {
    title: "Start a Project | Media4U",
    description:
      "Professional web design packages and VR experiences. Tell us about your project and let's build something together.",
  },
};

export default function StartProjectPage(): ReactElement {
  return <StartProjectContent />;
}
