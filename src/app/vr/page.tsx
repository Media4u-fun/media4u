import { Metadata } from "next";
import VRPageClient from "./VRPageClient";

export const metadata: Metadata = {
  title: "VR Experiences - Virtual Reality Environments & Digital Worlds",
  description: "Explore immersive VR experiences, virtual properties, and destinations created by Media4U. Step into stunning virtual environments and digital worlds.",
  keywords: ["VR experiences", "virtual reality", "virtual worlds", "virtual properties", "VR destinations", "immersive environments", "3D virtual worlds", "VR real estate"],
  openGraph: {
    title: "Media4U VR Experiences - Virtual Reality & Digital Worlds",
    description: "Explore immersive VR experiences, virtual properties, and stunning destinations.",
    type: "website",
    url: "https://media4u.fun/vr",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U VR Experiences",
    description: "Step into stunning virtual environments and digital worlds.",
  },
  alternates: {
    canonical: "https://media4u.fun/vr",
  },
};

export default function VRPage() {
  return <VRPageClient />;
}
