"use client";

import { type ReactNode } from "react";
import { useHasFeature } from "./FeatureContext";
import { LockedFeature } from "./LockedFeature";

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  // If true, shows the locked/upgrade prompt. If false, hides completely.
  showLocked?: boolean;
  featureName?: string;
}

export function FeatureGate({
  featureKey,
  children,
  showLocked = false,
  featureName,
}: FeatureGateProps) {
  const hasAccess = useHasFeature(featureKey);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showLocked) {
    return <LockedFeature featureKey={featureKey} featureName={featureName} />;
  }

  return null;
}
