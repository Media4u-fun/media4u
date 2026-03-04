"use client";

import { use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { ReviewWall } from "@/templates/modules/reviews/review-wall";
import { ReviewSubmit } from "@/templates/modules/reviews/review-submit";
import { useSiteData, SiteLoading, SiteNotFound, FeatureNotAvailable } from "../use-site-data";

export default function ReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const siteData = useSiteData(slug);
  const submitReview = useMutation(api.factory.submitReview);

  const orgId = siteData?.org._id as Id<"clientOrgs"> | undefined;
  const reviews = useQuery(
    api.factory.listReviews,
    orgId ? { orgId, status: "approved" } : "skip"
  );

  if (siteData === undefined) return <SiteLoading />;
  if (siteData === null) return <SiteNotFound />;
  if (!siteData.enabledFeatures.includes("reviews")) {
    return <FeatureNotAvailable slug={slug} />;
  }

  const approvedReviews = (reviews ?? []).map((r) => ({
    _id: r._id,
    customerName: r.customerName,
    customerLocation: r.customerLocation,
    rating: r.rating,
    text: r.text,
    serviceType: r.serviceType,
    submittedAt: r.submittedAt,
  }));

  return (
    <div className="min-h-screen bg-[#141419] text-white pt-16">
      <ReviewWall reviews={approvedReviews} />
      <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-12 pb-20">
        <ReviewSubmit
          onSubmit={async (review) => {
            await submitReview({
              orgId: orgId!,
              ...review,
            });
          }}
        />
      </div>
    </div>
  );
}
