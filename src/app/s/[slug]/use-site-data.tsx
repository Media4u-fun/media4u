"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Loader2 } from "lucide-react";

// Shared hook + wrapper for all /s/[slug]/* pages
export function useSiteData(slug: string) {
  return useQuery(api.factory.getPublicSiteData, { slug });
}

export function SiteLoading() {
  return (
    <div className="min-h-screen bg-[#141419] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
    </div>
  );
}

export function SiteNotFound() {
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

export function FeatureNotAvailable({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-[#141419] flex items-center justify-center text-white">
      <div className="text-center">
        <h1 className="text-2xl font-display mb-4">Page Not Available</h1>
        <p className="text-zinc-400 mb-6">
          This feature is not enabled for this site.
        </p>
        <a
          href={`/s/${slug}`}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
