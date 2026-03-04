"use client";

import { type ReactNode } from "react";
import { FeatureGate } from "@/lib/features/FeatureGate";
import { type TemplateSectionKey, getRequiredFeature } from "./feature-map";

interface GatedSectionProps {
  section: TemplateSectionKey;
  children: ReactNode;
  // If true, shows upgrade prompt when locked. If false, hides section entirely.
  showLocked?: boolean;
  featureName?: string;
}

// Wraps a template section with feature gating based on the section-to-feature mapping.
// Usage: <GatedSection section="blog"><BlogList /></GatedSection>
export function GatedSection({
  section,
  children,
  showLocked = false,
  featureName,
}: GatedSectionProps) {
  const featureKey = getRequiredFeature(section);

  return (
    <FeatureGate
      featureKey={featureKey}
      showLocked={showLocked}
      featureName={featureName}
    >
      {children}
    </FeatureGate>
  );
}
