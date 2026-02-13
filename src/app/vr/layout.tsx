import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VR Experiences",
  description: "Explore immersive VR environments and virtual experiences. Custom virtual reality properties, destinations, event spaces, showrooms, and art galleries built by Media4U.",
  keywords: [
    "VR",
    "virtual reality",
    "VR environments",
    "VR experiences",
    "virtual worlds",
    "VR properties",
    "virtual showrooms",
    "VR destinations",
    "immersive experiences",
    "custom VR development",
    "virtual reality development",
  ],
  openGraph: {
    title: "VR Environments & Virtual Experiences | Media4U",
    description: "Explore immersive VR environments and custom virtual experiences.",
  },
};

export default function VRLayout({ children }: { children: ReactNode }) {
  return children;
}
