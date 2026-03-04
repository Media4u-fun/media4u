"use client";

import { Lock } from "lucide-react";

// Feature key to human-readable name mapping
const FEATURE_NAMES: Record<string, string> = {
  core_pages: "Core Pages",
  gallery: "Photo Gallery",
  contact_form: "Contact Form",
  seo: "SEO Optimization",
  blog: "Blog",
  booking: "Online Booking",
  reviews: "Customer Reviews",
  quote_widget: "Quote Request Form",
  newsletter: "Email Newsletter",
  email_notifications: "Email Notifications",
  analytics: "Analytics Dashboard",
  mapping: "Service Area Mapping",
  client_portal: "Client Portal",
  integration_vault: "Integration Hub",
  pdf_export: "PDF Export",
  community: "Community Forum",
  advanced_scheduling: "Advanced Scheduling",
};

// Which plan tier unlocks each feature
const FEATURE_PLAN: Record<string, string> = {
  core_pages: "Starter",
  gallery: "Starter",
  contact_form: "Starter",
  seo: "Starter",
  blog: "Growth",
  booking: "Growth",
  reviews: "Growth",
  quote_widget: "Growth",
  newsletter: "Growth",
  email_notifications: "Growth",
  analytics: "Growth",
  mapping: "Enterprise",
  client_portal: "Enterprise",
  integration_vault: "Enterprise",
  pdf_export: "Enterprise",
  community: "Enterprise",
  advanced_scheduling: "Enterprise",
};

interface LockedFeatureProps {
  featureKey: string;
  featureName?: string;
}

export function LockedFeature({ featureKey, featureName }: LockedFeatureProps) {
  const name = featureName || FEATURE_NAMES[featureKey] || featureKey;
  const requiredPlan = FEATURE_PLAN[featureKey] || "Growth";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.05]">
          <Lock className="h-6 w-6 text-zinc-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-300">{name}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            This feature is available on the {requiredPlan} plan and above.
          </p>
        </div>
        <button className="mt-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2 text-sm font-medium text-white hover:from-cyan-400 hover:to-blue-500 transition-all">
          Upgrade to {requiredPlan}
        </button>
      </div>
    </div>
  );
}
