import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VR & Multiverse",
  description: "Explore immersive VR environments and multiverse experiences. Custom virtual reality properties, destinations, event spaces, showrooms, and art galleries built by Media4U.",
  keywords: [
    "VR",
    "virtual reality",
    "VR environments",
    "VR experiences",
    "metaverse",
    "VR properties",
    "virtual showrooms",
    "VR destinations",
    "immersive experiences",
    "custom VR development",
    "virtual reality development",
  ],
  openGraph: {
    title: "VR Environments & Multiverse Experiences | Media4U",
    description: "Explore immersive VR environments and custom multiverse experiences.",
  },
};

export default function VRLayout({ children }: { children: ReactNode }) {
  return children;
}
