"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft, Eye, Monitor, Tablet, Smartphone,
  Zap, Rocket, Crown, Loader2, ExternalLink,
} from "lucide-react";
import { getTemplate } from "@/templates";
import { FeatureProvider } from "@/lib/features/FeatureContext";
import { defaultPoolContent } from "@/templates/pool-service/content";

// Simulated feature sets per plan for preview
const PLAN_FEATURES: Record<string, string[]> = {
  starter: ["core_pages", "gallery", "contact_form", "seo"],
  growth: [
    "core_pages", "gallery", "contact_form", "seo",
    "blog", "booking", "reviews", "quote_widget",
    "newsletter", "email_notifications", "analytics",
  ],
  enterprise: [
    "core_pages", "gallery", "contact_form", "seo",
    "blog", "booking", "reviews", "quote_widget",
    "newsletter", "email_notifications", "analytics",
    "mapping", "client_portal", "integration_vault",
    "pdf_export", "community", "advanced_scheduling",
  ],
};

type ViewMode = "desktop" | "tablet" | "mobile";
type PreviewPlan = "actual" | "starter" | "growth" | "enterprise";

export default function OrgPreviewPage() {
  const params = useParams() as { orgId: string };
  const orgId = params.orgId as Id<"clientOrgs">;

  const org = useQuery(api.factory.getClientOrg, { orgId });
  const allContent = useQuery(api.factory.getAllTemplateContent, { orgId });
  const enabledFeatures = useQuery(api.factory.getEnabledFeatureKeys, { orgId });

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [previewPlan, setPreviewPlan] = useState<PreviewPlan>("actual");

  if (!org || enabledFeatures === undefined || allContent === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const template = getTemplate(org.industry || "pool-service");
  if (!template) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No template for industry: {org.industry || "none"}</p>
        <Link href={`/admin/factory/${orgId}`} className="text-cyan-400 mt-4 inline-block">
          Back to org
        </Link>
      </div>
    );
  }

  const Template = template.component;

  // Choose features based on preview plan
  const features =
    previewPlan === "actual"
      ? enabledFeatures
      : PLAN_FEATURES[previewPlan] || enabledFeatures;

  // Build content from Convex data
  const templateContent: Record<string, unknown> = {};
  if (allContent) {
    for (const [key, value] of Object.entries(allContent)) {
      templateContent[key] = value;
    }
  }

  // Iframe width based on view mode
  const iframeWidth =
    viewMode === "desktop" ? "100%" : viewMode === "tablet" ? "768px" : "375px";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top toolbar */}
      <div className="sticky top-0 z-[100] bg-[#141419]/95 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          {/* Left - back + org name */}
          <div className="flex items-center gap-4">
            <Link
              href={`/admin/factory/${orgId}`}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">{org.name}</span>
              <span className="text-xs text-gray-500">Preview</span>
            </div>
          </div>

          {/* Center - device toggle */}
          <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1">
            {([
              { key: "desktop" as const, icon: Monitor, label: "Desktop" },
              { key: "tablet" as const, icon: Tablet, label: "Tablet" },
              { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
            ]).map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === mode.key
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
                title={mode.label}
              >
                <mode.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            ))}
          </div>

          {/* Right - plan preview + open in new tab */}
          <div className="flex items-center gap-3">
            {/* Plan tier toggle */}
            <div className="flex items-center gap-1 bg-white/[0.05] rounded-lg p-1">
              <button
                onClick={() => setPreviewPlan("actual")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  previewPlan === "actual"
                    ? "bg-white/10 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Actual
              </button>
              {([
                { key: "starter" as const, icon: Zap, color: "text-blue-400" },
                { key: "growth" as const, icon: Rocket, color: "text-purple-400" },
                { key: "enterprise" as const, icon: Crown, color: "text-amber-400" },
              ]).map((plan) => (
                <button
                  key={plan.key}
                  onClick={() => setPreviewPlan(plan.key)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    previewPlan === plan.key
                      ? `bg-white/10 ${plan.color}`
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <plan.icon className="w-3 h-3" />
                  <span className="hidden md:inline capitalize">{plan.key}</span>
                </button>
              ))}
            </div>

            <a
              href={`/s/${org.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30 text-xs transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Live
            </a>
          </div>
        </div>
      </div>

      {/* Preview area - isolate z-index so template headers don't overlap toolbar */}
      <div className="flex justify-center py-6 px-4 relative" style={{ zIndex: 0, isolation: "isolate" }}>
        <div
          className={`transition-all duration-300 ${
            viewMode !== "desktop" ? "border border-white/10 rounded-2xl overflow-hidden shadow-2xl" : "w-full"
          }`}
          style={{ width: iframeWidth, maxWidth: "100%" }}
        >
          <FeatureProvider
            enabledFeatures={features}
            plan={previewPlan === "actual" ? org.plan : previewPlan}
            orgId={org._id}
          >
            <Template content={templateContent as Partial<typeof defaultPoolContent>} />
          </FeatureProvider>
        </div>
      </div>
    </div>
  );
}
