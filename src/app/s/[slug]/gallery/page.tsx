"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { GalleryPage as GalleryPageComponent } from "@/templates/modules/gallery/gallery-page";
import { useSiteData, SiteLoading, SiteNotFound, FeatureNotAvailable } from "../use-site-data";

export default function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const siteData = useSiteData(slug);

  const orgId = siteData?.org._id as Id<"clientOrgs"> | undefined;
  const items = useQuery(
    api.factory.listGalleryItems,
    orgId ? { orgId } : "skip"
  );

  if (siteData === undefined) return <SiteLoading />;
  if (siteData === null) return <SiteNotFound />;
  if (!siteData.enabledFeatures.includes("gallery")) {
    return <FeatureNotAvailable slug={slug} />;
  }

  const galleryItems = (items ?? []).map((i) => ({
    _id: i._id,
    imageUrl: i.imageUrl,
    title: i.title,
    description: i.description,
    category: i.category,
  }));

  const categories = [
    ...new Set(galleryItems.map((i) => i.category).filter(Boolean)),
  ] as string[];

  return (
    <div className="min-h-screen bg-[#141419] text-white pt-16">
      <GalleryPageComponent items={galleryItems} categories={categories} />
    </div>
  );
}
