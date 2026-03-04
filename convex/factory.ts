import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import { Id } from "./_generated/dataModel";

// ========================================
// Plan Presets - what features each plan includes
// ========================================

const PLAN_PRESETS: Record<string, string[]> = {
  starter: [
    "core_pages",
    "gallery",
    "contact_form",
    "seo",
  ],
  growth: [
    "core_pages",
    "gallery",
    "contact_form",
    "seo",
    "blog",
    "booking",
    "reviews",
    "quote_widget",
    "newsletter",
    "email_notifications",
    "analytics",
  ],
  enterprise: [
    "core_pages",
    "gallery",
    "contact_form",
    "seo",
    "blog",
    "booking",
    "reviews",
    "quote_widget",
    "newsletter",
    "email_notifications",
    "analytics",
    "mapping",
    "client_portal",
    "integration_vault",
    "pdf_export",
    "community",
    "advanced_scheduling",
  ],
};

const PLAN_LIMITS: Record<string, { maxAdminUsers: number; maxFormSubmissions: number }> = {
  starter: { maxAdminUsers: 1, maxFormSubmissions: 100 },
  growth: { maxAdminUsers: 3, maxFormSubmissions: 500 },
  enterprise: { maxAdminUsers: 999, maxFormSubmissions: 999999 },
};

// ========================================
// Feature Check Helpers
// ========================================

/**
 * Check if an org has a specific feature enabled.
 * Use this in any query/mutation that needs feature gating.
 */
export async function hasFeature(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"clientOrgs">,
  featureKey: string
): Promise<boolean> {
  const feature = await ctx.db
    .query("orgFeatures")
    .withIndex("by_orgId_featureKey", (q) =>
      q.eq("orgId", orgId).eq("featureKey", featureKey)
    )
    .first();

  if (!feature || !feature.enabled) return false;

  // Check if trial has expired
  if (feature.source === "trial" && feature.trialEndsAt) {
    if (Date.now() > feature.trialEndsAt) return false;
  }

  return true;
}

/**
 * Require a feature to be enabled - throws if not.
 * Use this like requireAdmin() at the start of protected functions.
 */
export async function requireFeature(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"clientOrgs">,
  featureKey: string
): Promise<void> {
  const enabled = await hasFeature(ctx, orgId, featureKey);
  if (!enabled) {
    throw new ConvexError({
      code: "FEATURE_DISABLED",
      message: `This feature requires an upgrade. "${featureKey}" is not enabled for your plan.`,
      featureKey,
    });
  }
}

/**
 * Get all enabled features for an org.
 */
export async function getOrgFeatures(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"clientOrgs">
) {
  const features = await ctx.db
    .query("orgFeatures")
    .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
    .collect();

  return features.filter((f) => {
    if (!f.enabled) return false;
    // Filter out expired trials
    if (f.source === "trial" && f.trialEndsAt && Date.now() > f.trialEndsAt) {
      return false;
    }
    return true;
  });
}

// ========================================
// Queries
// ========================================

// Get all client orgs (admin only)
export const listClientOrgs = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("clientOrgs").order("desc").collect();
  },
});

// Get a single client org by ID (admin only)
export const getClientOrg = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, { orgId }) => {
    await requireAdmin(ctx);
    return await ctx.db.get(orgId);
  },
});

// Get all features for an org (admin only)
export const getOrgFeaturesQuery = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, { orgId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();
  },
});

// Get the full feature registry (admin only)
export const listFeatureRegistry = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("featureRegistry").collect();
  },
});

// Get plan presets (for display in admin UI)
export const getPlanPresets = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return PLAN_PRESETS;
  },
});

// ========================================
// Mutations
// ========================================

// Create a new client org
export const createClientOrg = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    ownerEmail: v.string(),
    plan: v.union(v.literal("starter"), v.literal("growth"), v.literal("enterprise")),
    industry: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check slug is unique
    const existing = await ctx.db
      .query("clientOrgs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      throw new ConvexError({ code: "DUPLICATE", message: "An org with this slug already exists" });
    }

    const limits = PLAN_LIMITS[args.plan];
    const now = Date.now();

    // Create the org
    const orgId = await ctx.db.insert("clientOrgs", {
      name: args.name,
      slug: args.slug,
      ownerEmail: args.ownerEmail,
      plan: args.plan,
      status: "active",
      setupFeePaid: false,
      maxAdminUsers: limits.maxAdminUsers,
      maxFormSubmissions: limits.maxFormSubmissions,
      industry: args.industry,
      projectId: args.projectId,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    // Apply plan preset - enable all features for this plan
    const features = PLAN_PRESETS[args.plan] || [];
    for (const featureKey of features) {
      await ctx.db.insert("orgFeatures", {
        orgId,
        featureKey,
        enabled: true,
        source: "plan",
        addedAt: now,
        updatedAt: now,
      });
    }

    return orgId;
  },
});

// Change a client's plan (upgrades/downgrades)
export const changeClientPlan = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    newPlan: v.union(v.literal("starter"), v.literal("growth"), v.literal("enterprise")),
  },
  handler: async (ctx, { orgId, newPlan }) => {
    await requireAdmin(ctx);

    const org = await ctx.db.get(orgId);
    if (!org) throw new ConvexError({ code: "NOT_FOUND", message: "Org not found" });

    const now = Date.now();
    const limits = PLAN_LIMITS[newPlan];
    const newFeatureKeys = PLAN_PRESETS[newPlan] || [];

    // Update the org's plan
    await ctx.db.patch(orgId, {
      plan: newPlan,
      maxAdminUsers: limits.maxAdminUsers,
      maxFormSubmissions: limits.maxFormSubmissions,
      updatedAt: now,
    });

    // Get all current features
    const currentFeatures = await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();

    // Disable plan-sourced features that aren't in the new plan
    for (const feature of currentFeatures) {
      if (feature.source === "plan") {
        if (!newFeatureKeys.includes(feature.featureKey)) {
          await ctx.db.patch(feature._id, { enabled: false, updatedAt: now });
        }
      }
    }

    // Enable features for the new plan
    for (const featureKey of newFeatureKeys) {
      const existing = currentFeatures.find((f) => f.featureKey === featureKey);
      if (existing) {
        await ctx.db.patch(existing._id, {
          enabled: true,
          source: "plan",
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("orgFeatures", {
          orgId,
          featureKey,
          enabled: true,
          source: "plan",
          addedAt: now,
          updatedAt: now,
        });
      }
    }
  },
});

// Toggle a single feature for an org (admin manual override)
export const toggleOrgFeature = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    featureKey: v.string(),
    enabled: v.boolean(),
    source: v.optional(v.union(
      v.literal("addon"),
      v.literal("trial"),
      v.literal("manual")
    )),
    trialDays: v.optional(v.number()), // For trial source, how many days
  },
  handler: async (ctx, { orgId, featureKey, enabled, source, trialDays }) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const featureSource = source || "manual";
    const trialEndsAt = featureSource === "trial" && trialDays
      ? now + trialDays * 24 * 60 * 60 * 1000
      : undefined;

    const existing = await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId_featureKey", (q) =>
        q.eq("orgId", orgId).eq("featureKey", featureKey)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled,
        source: featureSource,
        trialEndsAt,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("orgFeatures", {
        orgId,
        featureKey,
        enabled,
        source: featureSource,
        trialEndsAt,
        addedAt: now,
        updatedAt: now,
      });
    }
  },
});

// Start a 7-day trial of a feature for a client
export const startFeatureTrial = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    featureKey: v.string(),
  },
  handler: async (ctx, { orgId, featureKey }) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const trialEndsAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const existing = await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId_featureKey", (q) =>
        q.eq("orgId", orgId).eq("featureKey", featureKey)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: true,
        source: "trial",
        trialEndsAt,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("orgFeatures", {
        orgId,
        featureKey,
        enabled: true,
        source: "trial",
        trialEndsAt,
        addedAt: now,
        updatedAt: now,
      });
    }
  },
});

// ========================================
// Client-facing queries (for useFeature hook)
// ========================================

// Get org by owner's user ID (for clients to look up their own org)
export const getMyOrg = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("clientOrgs")
      .withIndex("by_ownerUserId", (q) => q.eq("ownerUserId", user._id))
      .first();
  },
});

// Get enabled feature keys for an org (lightweight - just returns keys)
export const getEnabledFeatureKeys = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, { orgId }) => {
    const features = await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();

    const now = Date.now();
    return features
      .filter((f) => {
        if (!f.enabled) return false;
        if (f.source === "trial" && f.trialEndsAt && now > f.trialEndsAt) return false;
        return true;
      })
      .map((f) => f.featureKey);
  },
});

// Get org by slug (for multi-tenant routing)
export const getOrgBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("clientOrgs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

// Get feature registry (public - for pricing page display)
export const getPublicFeatureRegistry = query({
  args: {},
  handler: async (ctx) => {
    const features = await ctx.db.query("featureRegistry").collect();
    return features
      .filter((f) => f.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((f) => ({
        key: f.key,
        name: f.name,
        description: f.description,
        category: f.category,
        includedInPlan: f.includedInPlan,
        isAddon: f.isAddon,
        addonPriceCents: f.addonPriceCents,
        icon: f.icon,
      }));
  },
});

// ========================================
// Internal mutations (called by Stripe webhooks)
// ========================================

// Map Stripe Price IDs to factory plans
// You'll set these in your .env or Stripe dashboard metadata
const STRIPE_PLAN_MAP: Record<string, "starter" | "growth" | "enterprise"> = {
  // These get populated from env vars at runtime
  // Format: STRIPE_PRICE_ID -> plan name
};

function getPlanFromPriceId(priceId: string): "starter" | "growth" | "enterprise" | null {
  // Check hardcoded map first
  if (STRIPE_PLAN_MAP[priceId]) return STRIPE_PLAN_MAP[priceId];

  // Check metadata convention: price nickname contains plan name
  // This is a fallback - Stripe price nicknames like "Factory Starter", "Factory Growth"
  return null;
}

// Handle new factory subscription from Stripe webhook
export const handleFactorySubscriptionCreated = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    customerEmail: v.string(),
    planName: v.optional(v.string()), // From Stripe price nickname
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Determine the plan from price ID or nickname
    let plan = getPlanFromPriceId(args.stripePriceId);
    if (!plan && args.planName) {
      const lower = args.planName.toLowerCase();
      if (lower.includes("enterprise")) plan = "enterprise";
      else if (lower.includes("growth") || lower.includes("pro")) plan = "growth";
      else if (lower.includes("starter")) plan = "starter";
    }
    if (!plan) plan = "starter"; // Default fallback

    // Find org by Stripe customer ID or email
    let org = await ctx.db
      .query("clientOrgs")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    if (!org) {
      org = await ctx.db
        .query("clientOrgs")
        .withIndex("by_ownerEmail", (q) => q.eq("ownerEmail", args.customerEmail))
        .first();
    }

    if (!org) {
      // No org found - log it but don't crash the webhook
      console.error(`Factory webhook: No org found for ${args.customerEmail} / ${args.stripeCustomerId}`);
      return;
    }

    // Update org with Stripe IDs and new plan
    const limits = PLAN_LIMITS[plan];
    await ctx.db.patch(org._id, {
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      plan,
      status: "active",
      maxAdminUsers: limits.maxAdminUsers,
      maxFormSubmissions: limits.maxFormSubmissions,
      updatedAt: now,
    });

    // Apply plan preset
    const newFeatureKeys = PLAN_PRESETS[plan] || [];
    const currentFeatures = await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
      .collect();

    for (const featureKey of newFeatureKeys) {
      const existing = currentFeatures.find((f) => f.featureKey === featureKey);
      if (existing) {
        await ctx.db.patch(existing._id, { enabled: true, source: "plan", updatedAt: now });
      } else {
        await ctx.db.insert("orgFeatures", {
          orgId: org._id,
          featureKey,
          enabled: true,
          source: "plan",
          addedAt: now,
          updatedAt: now,
        });
      }
    }
  },
});

// Handle factory subscription updated (plan change / upgrade / downgrade)
export const handleFactorySubscriptionUpdated = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    planName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find org by subscription ID
    const orgs = await ctx.db.query("clientOrgs").collect();
    const org = orgs.find((o) => o.stripeSubscriptionId === args.stripeSubscriptionId);
    if (!org) {
      console.error(`Factory webhook: No org found for subscription ${args.stripeSubscriptionId}`);
      return;
    }

    // Handle cancellation / past_due
    if (args.status === "canceled" || args.status === "unpaid") {
      await ctx.db.patch(org._id, {
        status: args.status === "canceled" ? "cancelled" : "suspended",
        updatedAt: now,
      });
      return;
    }

    if (args.status === "past_due") {
      await ctx.db.patch(org._id, { status: "suspended", updatedAt: now });
      return;
    }

    // Active subscription - check if plan changed
    let newPlan = getPlanFromPriceId(args.stripePriceId);
    if (!newPlan && args.planName) {
      const lower = args.planName.toLowerCase();
      if (lower.includes("enterprise")) newPlan = "enterprise";
      else if (lower.includes("growth") || lower.includes("pro")) newPlan = "growth";
      else if (lower.includes("starter")) newPlan = "starter";
    }

    if (newPlan && newPlan !== org.plan) {
      // Plan changed - update features
      const limits = PLAN_LIMITS[newPlan];
      await ctx.db.patch(org._id, {
        plan: newPlan,
        status: "active",
        maxAdminUsers: limits.maxAdminUsers,
        maxFormSubmissions: limits.maxFormSubmissions,
        updatedAt: now,
      });

      // Re-apply plan preset
      const newFeatureKeys = PLAN_PRESETS[newPlan] || [];
      const currentFeatures = await ctx.db
        .query("orgFeatures")
        .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
        .collect();

      // Disable plan-sourced features not in new plan
      for (const feature of currentFeatures) {
        if (feature.source === "plan" && !newFeatureKeys.includes(feature.featureKey)) {
          await ctx.db.patch(feature._id, { enabled: false, updatedAt: now });
        }
      }

      // Enable new plan features
      for (const featureKey of newFeatureKeys) {
        const existing = currentFeatures.find((f) => f.featureKey === featureKey);
        if (existing) {
          await ctx.db.patch(existing._id, { enabled: true, source: "plan", updatedAt: now });
        } else {
          await ctx.db.insert("orgFeatures", {
            orgId: org._id,
            featureKey,
            enabled: true,
            source: "plan",
            addedAt: now,
            updatedAt: now,
          });
        }
      }
    } else {
      // Same plan, just reactivate if was suspended
      await ctx.db.patch(org._id, { status: "active", updatedAt: now });
    }
  },
});

// Handle factory subscription deleted (cancelled)
export const handleFactorySubscriptionDeleted = internalMutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, { stripeSubscriptionId }) => {
    const orgs = await ctx.db.query("clientOrgs").collect();
    const org = orgs.find((o) => o.stripeSubscriptionId === stripeSubscriptionId);
    if (!org) return;

    await ctx.db.patch(org._id, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    // Disable all plan-sourced features (keep addons/manual)
    const features = await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
      .collect();

    for (const feature of features) {
      if (feature.source === "plan") {
        await ctx.db.patch(feature._id, { enabled: false, updatedAt: Date.now() });
      }
    }
  },
});

// Handle factory addon subscription item added
export const handleFactoryAddonAdded = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    featureKey: v.string(),
    stripeSubscriptionItemId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const org = await ctx.db
      .query("clientOrgs")
      .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .first();

    if (!org) {
      console.error(`Factory webhook: No org found for addon ${args.stripeCustomerId}`);
      return;
    }

    const existing = await ctx.db
      .query("orgFeatures")
      .withIndex("by_orgId_featureKey", (q) =>
        q.eq("orgId", org._id).eq("featureKey", args.featureKey)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        enabled: true,
        source: "addon",
        stripeSubscriptionItemId: args.stripeSubscriptionItemId,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("orgFeatures", {
        orgId: org._id,
        featureKey: args.featureKey,
        enabled: true,
        source: "addon",
        stripeSubscriptionItemId: args.stripeSubscriptionItemId,
        addedAt: now,
        updatedAt: now,
      });
    }
  },
});

// ========================================
// Seed the feature registry with all modules
// ========================================

export const seedFeatureRegistry = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = Date.now();

    // Check if already seeded
    const existing = await ctx.db.query("featureRegistry").first();
    if (existing) {
      throw new ConvexError({ code: "ALREADY_SEEDED", message: "Feature registry already has data" });
    }

    const features = [
      // Core (always included in every plan)
      { key: "core_pages", name: "Core Pages", description: "Home, About, Services, Contact pages", category: "core" as const, includedInPlan: "starter" as const, isAddon: false, sortOrder: 1, icon: "Layout" },
      { key: "gallery", name: "Photo Gallery", description: "Image showcase with lightbox", category: "core" as const, includedInPlan: "starter" as const, isAddon: false, sortOrder: 2, icon: "Image" },
      { key: "contact_form", name: "Contact Form", description: "Contact form with email notifications", category: "core" as const, includedInPlan: "starter" as const, isAddon: false, sortOrder: 3, icon: "Mail" },
      { key: "seo", name: "Basic SEO", description: "Sitemap, robots.txt, meta tags", category: "core" as const, includedInPlan: "starter" as const, isAddon: false, sortOrder: 4, icon: "Search" },

      // Growth tier features
      { key: "blog", name: "Blog System", description: "Blog with Tiptap rich text editor", category: "content" as const, includedInPlan: "growth" as const, isAddon: true, addonPriceCents: 2900, sortOrder: 10, icon: "FileText" },
      { key: "booking", name: "Booking & Appointments", description: "Online scheduling and appointment management", category: "operations" as const, includedInPlan: "growth" as const, isAddon: true, addonPriceCents: 2900, sortOrder: 11, icon: "Calendar" },
      { key: "reviews", name: "Reviews & Testimonials", description: "Customer review collection and display", category: "content" as const, includedInPlan: "growth" as const, isAddon: false, sortOrder: 12, icon: "Star" },
      { key: "quote_widget", name: "Quote Request Widget", description: "Quick quote request form for services", category: "operations" as const, includedInPlan: "growth" as const, isAddon: false, sortOrder: 13, icon: "DollarSign" },
      { key: "newsletter", name: "Newsletter System", description: "Email newsletter with subscriber management", category: "communication" as const, includedInPlan: "growth" as const, isAddon: true, addonPriceCents: 1900, sortOrder: 14, icon: "Send" },
      { key: "email_notifications", name: "Email Notifications", description: "Automated email alerts via Resend", category: "communication" as const, includedInPlan: "growth" as const, isAddon: false, sortOrder: 15, icon: "Bell" },
      { key: "analytics", name: "Analytics Integration", description: "Google Analytics and tracking setup", category: "analytics" as const, includedInPlan: "growth" as const, isAddon: false, sortOrder: 16, icon: "BarChart" },

      // Enterprise tier features
      { key: "mapping", name: "GPS Mapping & Routing", description: "Google Maps integration with route optimization (LeadRoute)", category: "operations" as const, includedInPlan: "enterprise" as const, isAddon: true, addonPriceCents: 4900, sortOrder: 20, icon: "Map" },
      { key: "client_portal", name: "Client Portal", description: "Dedicated client login area with project tracking", category: "operations" as const, includedInPlan: "enterprise" as const, isAddon: false, sortOrder: 21, icon: "Users" },
      { key: "integration_vault", name: "Integration Vault", description: "Secure storage for API keys and third-party credentials", category: "operations" as const, includedInPlan: "enterprise" as const, isAddon: false, sortOrder: 22, icon: "Lock" },
      { key: "pdf_export", name: "PDF & Excel Export", description: "Generate and export reports", category: "analytics" as const, includedInPlan: "enterprise" as const, isAddon: false, sortOrder: 23, icon: "Download" },
      { key: "community", name: "Community Portal", description: "Member community with profiles and comments", category: "content" as const, includedInPlan: "enterprise" as const, isAddon: true, addonPriceCents: 3900, sortOrder: 24, icon: "Globe" },
      { key: "advanced_scheduling", name: "Advanced Scheduling", description: "Multi-tech job routing and field scheduling", category: "operations" as const, includedInPlan: "enterprise" as const, isAddon: false, sortOrder: 25, icon: "Route" },
    ];

    for (const feature of features) {
      await ctx.db.insert("featureRegistry", {
        ...feature,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { inserted: features.length };
  },
});
