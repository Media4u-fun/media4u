"use client";

import { use, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BlogList } from "@/templates/modules/blog/blog-list";
import { BlogSidebar } from "@/templates/modules/blog/blog-sidebar";
import { useSiteData, SiteLoading, SiteNotFound, FeatureNotAvailable } from "../use-site-data";

export default function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const siteData = useSiteData(slug);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();

  const orgId = siteData?.org._id as Id<"clientOrgs"> | undefined;
  const posts = useQuery(
    api.factory.listBlogPosts,
    orgId ? { orgId, status: "published" } : "skip"
  );

  if (siteData === undefined) return <SiteLoading />;
  if (siteData === null) return <SiteNotFound />;
  if (!siteData.enabledFeatures.includes("blog")) {
    return <FeatureNotAvailable slug={slug} />;
  }

  const allPosts = posts ?? [];
  const categories = [...new Set(allPosts.map((p) => p.category).filter(Boolean))] as string[];
  const filtered = activeCategory
    ? allPosts.filter((p) => p.category === activeCategory)
    : allPosts;

  return (
    <div className="min-h-screen bg-[#141419] text-white pt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          <BlogList
            posts={filtered.map((p) => ({
              _id: p._id,
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt,
              coverImage: p.coverImage,
              category: p.category,
              author: p.author,
              publishedAt: p.publishedAt,
            }))}
            onPostClick={(postSlug) => {
              window.location.href = `/s/${slug}/blog/${postSlug}`;
            }}
          />
          <BlogSidebar
            posts={allPosts.map((p) => ({
              _id: p._id,
              title: p.title,
              slug: p.slug,
              category: p.category,
              publishedAt: p.publishedAt,
            }))}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={setActiveCategory}
            onPostClick={(postSlug) => {
              window.location.href = `/s/${slug}/blog/${postSlug}`;
            }}
          />
        </div>
      </div>
    </div>
  );
}
