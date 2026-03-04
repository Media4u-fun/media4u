"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BlogPostView } from "@/templates/modules/blog/blog-post";
import { useSiteData, SiteLoading, SiteNotFound, FeatureNotAvailable } from "../../use-site-data";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; postSlug: string }>;
}) {
  const { slug, postSlug } = use(params);
  const siteData = useSiteData(slug);

  const orgId = siteData?.org._id as Id<"clientOrgs"> | undefined;
  const post = useQuery(
    api.factory.getBlogPost,
    orgId ? { orgId, slug: postSlug } : "skip"
  );

  if (siteData === undefined) return <SiteLoading />;
  if (siteData === null) return <SiteNotFound />;
  if (!siteData.enabledFeatures.includes("blog")) {
    return <FeatureNotAvailable slug={slug} />;
  }

  if (post === undefined) return <SiteLoading />;
  if (post === null) {
    return (
      <div className="min-h-screen bg-[#141419] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-display mb-4">Post Not Found</h1>
          <a
            href={`/s/${slug}/blog`}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Back to Blog
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141419] text-white pt-24">
      <BlogPostView
        post={{
          title: post.title,
          content: post.content,
          coverImage: post.coverImage,
          category: post.category,
          author: post.author,
          publishedAt: post.publishedAt,
          tags: post.tags,
        }}
        onBack={() => {
          window.location.href = `/s/${slug}/blog`;
        }}
      />
    </div>
  );
}
