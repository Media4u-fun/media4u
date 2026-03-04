"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { getTemplate } from "@/templates";
import { FeatureProvider } from "@/lib/features/FeatureContext";
import { Loader2 } from "lucide-react";

export default function ClientSitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const siteData = useQuery(api.factory.getPublicSiteData, { slug });

  // Loading state
  if (siteData === undefined) {
    return (
      <div className="min-h-screen bg-[#141419] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  // Not found or cancelled
  if (siteData === null) {
    return (
      <div className="min-h-screen bg-[#141419] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-display mb-4">Site Not Found</h1>
          <p className="text-zinc-400">
            This site doesn&apos;t exist or is no longer active.
          </p>
        </div>
      </div>
    );
  }

  const { org, enabledFeatures, content } = siteData;

  // Get the template for this industry
  const template = getTemplate(org.industry || "pool-service");
  if (!template) {
    return (
      <div className="min-h-screen bg-[#141419] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-display mb-4">Template Not Found</h1>
          <p className="text-zinc-400">
            No template configured for this site.
          </p>
        </div>
      </div>
    );
  }

  const Template = template.component;

  // Build the content object from Convex data
  // The template components use { ...defaultPoolContent, ...content } pattern
  // so we merge the Convex content sections into a single content override
  const templateContent = buildTemplateContent(content, siteData);

  return (
    <FeatureProvider
      enabledFeatures={enabledFeatures}
      plan={org.plan}
      orgId={org._id}
    >
      <Template content={templateContent} />
    </FeatureProvider>
  );
}

// Merge Convex content sections into a PoolContent-compatible object
function buildTemplateContent(
  content: Record<string, unknown>,
  siteData: {
    reviews: Array<{ customerName: string; customerLocation?: string; rating: number; text: string }>;
  }
) {
  const result: Record<string, unknown> = {};

  // Business info
  if (content.business && typeof content.business === "object") {
    result.business = content.business;
  }

  // Hero
  if (content.hero && typeof content.hero === "object") {
    result.hero = content.hero;
  }

  // About
  if (content.about && typeof content.about === "object") {
    result.about = content.about;
  }

  // Services (array)
  if (content.services && Array.isArray(content.services)) {
    result.services = content.services;
  }

  // Process (array)
  if (content.process && Array.isArray(content.process)) {
    result.process = content.process;
  }

  // FAQs (array)
  if (content.faqs && Array.isArray(content.faqs)) {
    result.faqs = content.faqs;
  }

  // Quote form config
  if (content.quoteForm && typeof content.quoteForm === "object") {
    result.quoteForm = content.quoteForm;
  }

  // Reviews from the reviews table (not templateContent)
  if (siteData.reviews && siteData.reviews.length > 0) {
    result.reviews = siteData.reviews.map((r) => ({
      name: r.customerName,
      location: r.customerLocation || "",
      rating: r.rating,
      text: r.text,
    }));
  }

  return result;
}
