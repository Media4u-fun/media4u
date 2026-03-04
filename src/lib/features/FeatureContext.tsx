"use client";

import { createContext, useContext, type ReactNode } from "react";

interface FeatureContextValue {
  enabledFeatures: string[];
  hasFeature: (featureKey: string) => boolean;
  plan: "starter" | "growth" | "enterprise" | null;
  orgId: string | null;
}

const FeatureContext = createContext<FeatureContextValue>({
  enabledFeatures: [],
  hasFeature: () => false,
  plan: null,
  orgId: null,
});

export function FeatureProvider({
  children,
  enabledFeatures,
  plan,
  orgId,
}: {
  children: ReactNode;
  enabledFeatures: string[];
  plan: "starter" | "growth" | "enterprise" | null;
  orgId: string | null;
}) {
  const hasFeature = (featureKey: string) =>
    enabledFeatures.includes(featureKey);

  return (
    <FeatureContext.Provider value={{ enabledFeatures, hasFeature, plan, orgId }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeatureContext);
}

export function useHasFeature(featureKey: string) {
  const { hasFeature } = useFeatures();
  return hasFeature(featureKey);
}
