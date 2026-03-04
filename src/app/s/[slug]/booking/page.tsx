"use client";

import { use } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { BookingForm } from "@/templates/modules/booking/booking-form";
import { useSiteData, SiteLoading, SiteNotFound, FeatureNotAvailable } from "../use-site-data";
import { defaultPoolContent } from "@/templates/pool-service/content";

export default function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const siteData = useSiteData(slug);
  const createBooking = useMutation(api.factory.createBooking);

  if (siteData === undefined) return <SiteLoading />;
  if (siteData === null) return <SiteNotFound />;
  if (!siteData.enabledFeatures.includes("booking")) {
    return <FeatureNotAvailable slug={slug} />;
  }

  const orgId = siteData.org._id as Id<"clientOrgs">;

  // Get service types from content or defaults
  const contentServices = siteData.content.quoteForm as
    | { serviceTypes?: string[] }
    | undefined;
  const serviceTypes =
    contentServices?.serviceTypes ?? defaultPoolContent.quoteForm.serviceTypes;

  return (
    <div className="min-h-screen bg-[#141419] text-white pt-16">
      <BookingForm
        serviceTypes={serviceTypes}
        onSubmit={async (booking) => {
          await createBooking({ orgId, ...booking });
        }}
      />
    </div>
  );
}
