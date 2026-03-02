import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VR Community - Creators, Virtual Worlds & Digital Art",
  description:
    "Join the Media4U VR community. Connect with creators, explore virtual worlds, share your builds, and be part of an immersive creative network.",
  keywords: [
    "VR community",
    "virtual worlds",
    "VR creators",
    "digital art",
    "metaverse",
    "immersive experiences",
    "virtual reality community",
  ],
  openGraph: {
    title: "Media4U VR Community - Creators & Virtual Worlds",
    description:
      "Connect with creators, explore virtual worlds, and join an immersive creative community.",
    type: "website",
    url: "https://media4u.fun/community",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U VR Community",
    description:
      "Connect with creators and explore virtual worlds.",
  },
  alternates: {
    canonical: "https://media4u.fun/community",
  },
};

export default function CommunityLayout({ children }: { children: ReactNode }): ReactNode {
  return children;
}
