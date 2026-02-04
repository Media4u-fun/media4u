import { Metadata } from "next";
import BlogPageClient from "./BlogPageClient";

export const metadata: Metadata = {
  title: "Blog - Latest Insights on VR, Web Design & Digital Innovation",
  description: "Explore our thoughts on VR technology, web design, multiverse experiences, and the future of digital innovation. Stay updated with the latest trends and insights from Media4U.",
  keywords: ["VR blog", "web design blog", "digital innovation", "virtual reality insights", "tech trends", "multiverse", "immersive experiences"],
  openGraph: {
    title: "Media4U Blog - VR, Web Design & Digital Innovation",
    description: "Explore our thoughts on VR technology, web design, and the future of digital experiences.",
    type: "website",
    url: "https://media4u.fun/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Media4U Blog",
    description: "Latest insights on VR, web design, and digital innovation.",
  },
  alternates: {
    canonical: "https://media4u.fun/blog",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
