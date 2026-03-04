"use client";

import { ReactNode } from "react";
import { useFeature } from "./FeatureContext";
import { Lock, Rocket } from "lucide-react";

// ========================================
// FeatureGate - only renders children if feature is enabled
// ========================================

/**
 * FeatureGate - wraps UI that should only show when a feature is enabled.
 * If the feature is off, renders nothing (or an optional fallback).
 *
 * Usage:
 *   <FeatureGate feature="blog">
 *     <BlogSection />
 *   </FeatureGate>
 *
 *   <FeatureGate feature="mapping" fallback={<LockedFeature feature="mapping" />}>
 *     <MapView />
 *   </FeatureGate>
 */
export function FeatureGate({
  feature,
  children,
  fallback,
}: {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { enabled, isLoading } = useFeature(feature);

  // Don't render anything while loading to prevent flash
  if (isLoading) return null;

  if (!enabled) return fallback ? <>{fallback}</> : null;

  return <>{children}</>;
}

// ========================================
// LockedFeature - "upgrade to unlock" preview card
// ========================================

/**
 * LockedFeature - shows a locked preview with upgrade CTA.
 * Use this as a fallback in FeatureGate or standalone.
 *
 * Usage:
 *   <LockedFeature
 *     feature="mapping"
 *     title="GPS Mapping & Routing"
 *     description="Track your team in real-time with route optimization."
 *   />
 */
export function LockedFeature({
  title,
  description,
  onUpgrade,
}: {
  feature: string;
  title?: string;
  description?: string;
  onUpgrade?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
      {/* Blur overlay effect */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/20 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-purple-400" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">
            {title || "Premium Feature"}
          </h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            {description || "Upgrade your plan to unlock this feature."}
          </p>
        </div>

        <button
          onClick={onUpgrade}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 font-medium text-sm transition-all"
        >
          <Rocket className="w-4 h-4" />
          Upgrade to Unlock
        </button>
      </div>
    </div>
  );
}
