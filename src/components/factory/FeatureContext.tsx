"use client";

import { createContext, useContext, ReactNode, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// ========================================
// Types
// ========================================

interface FeatureContextType {
  orgId: Id<"clientOrgs"> | null;
  plan: "starter" | "growth" | "enterprise" | null;
  enabledFeatures: string[];
  isLoading: boolean;
  hasFeature: (featureKey: string) => boolean;
}

const FeatureContext = createContext<FeatureContextType>({
  orgId: null,
  plan: null,
  enabledFeatures: [],
  isLoading: true,
  hasFeature: () => false,
});

// ========================================
// Provider - wrap client site pages with this
// ========================================

/**
 * FeatureProvider - provides feature flag context to client site pages.
 *
 * Usage:
 *   <FeatureProvider orgId={orgId}>
 *     <YourClientSitePages />
 *   </FeatureProvider>
 *
 * Or with auto-detection (for logged-in clients):
 *   <FeatureProvider>
 *     <YourClientSitePages />
 *   </FeatureProvider>
 */
export function FeatureProvider({
  orgId: propOrgId,
  children,
}: {
  orgId?: Id<"clientOrgs">;
  children: ReactNode;
}) {
  // If no orgId provided, try to detect from logged-in user
  const myOrg = useQuery(api.factory.getMyOrg);
  const resolvedOrgId = propOrgId || myOrg?._id || null;

  // Get enabled features for this org
  const enabledFeatures = useQuery(
    api.factory.getEnabledFeatureKeys,
    resolvedOrgId ? { orgId: resolvedOrgId } : "skip"
  );

  const plan = propOrgId
    ? null // We don't have the plan from propOrgId alone
    : myOrg?.plan ?? null;

  const value = useMemo<FeatureContextType>(
    () => ({
      orgId: resolvedOrgId,
      plan,
      enabledFeatures: enabledFeatures ?? [],
      isLoading: enabledFeatures === undefined,
      hasFeature: (key: string) => (enabledFeatures ?? []).includes(key),
    }),
    [resolvedOrgId, plan, enabledFeatures]
  );

  return (
    <FeatureContext.Provider value={value}>
      {children}
    </FeatureContext.Provider>
  );
}

// ========================================
// Hook - check if a feature is enabled
// ========================================

/**
 * useFeature - check if a specific feature is enabled for the current org.
 *
 * Usage:
 *   const { enabled, isLoading } = useFeature("mapping");
 *   if (!enabled) return <LockedFeature feature="mapping" />;
 */
export function useFeature(featureKey: string) {
  const ctx = useContext(FeatureContext);
  return {
    enabled: ctx.hasFeature(featureKey),
    isLoading: ctx.isLoading,
    orgId: ctx.orgId,
    plan: ctx.plan,
  };
}

/**
 * useFeatures - get all feature context at once.
 *
 * Usage:
 *   const { hasFeature, enabledFeatures, plan } = useFeatures();
 */
export function useFeatures() {
  return useContext(FeatureContext);
}
