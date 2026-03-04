"use client";

// Feature toggles are already built into the main [orgId]/page.tsx.
// This file re-exports a standalone version for use in a tabbed layout if needed.
// For now, the feature toggles live directly in the org detail page.
// This placeholder exists so the architecture supports extracting them later.

export { default as FeatureTogglesPage } from "./page";
