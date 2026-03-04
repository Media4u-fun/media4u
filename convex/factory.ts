import { v } from "convex/values";
import { query, mutation, internalMutation, QueryCtx, MutationCtx } from "./_generated/server";
import { ConvexError } from "convex/values";
import { requireAdmin, getAuthenticatedUser } from "./auth";
import { Id } from "./_generated/dataModel";

// ========================================
// Factory Signup Pipeline
// ========================================

// Public mutation - no auth required (public signup form)
export const submitFactorySignup = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    businessName: v.string(),
    industry: v.optional(v.string()),
    phone: v.optional(v.string()),
    plan: v.string(), // "starter", "growth", "enterprise"
    paymentType: v.optional(v.string()), // "subscribe" or "own"
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const type = args.paymentType || "subscribe";
    const planPrices: Record<string, { sub: number; own: number; maint: number }> = {
      starter: { sub: 79, own: 899, maint: 39 },
      growth: { sub: 149, own: 1399, maint: 79 },
      enterprise: { sub: 299, own: 1999, maint: 149 },
    };
    const prices = planPrices[args.plan] || planPrices.starter;
    const priceLabel = type === "own"
      ? `$${prices.own.toLocaleString()} + $${prices.maint}/mo (own)`
      : `$${prices.sub}/mo (subscribe)`;

    const leadId = await ctx.db.insert("leads", {
      name: args.name,
      email: args.email,
      businessName: args.businessName,
      industry: args.industry,
      phone: args.phone,
      source: "factory-signup",
      status: "new",
      notes: `Plan: ${args.plan} - ${priceLabel}`,
      createdAt: now,
    });

    return leadId;
  },
});

// Admin query - list all factory signups
export const listFactorySignups = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_created")
      .order("desc")
      .collect();
    return leads.filter((l) => l.source === "factory-signup");
  },
});

// Admin mutation - update a lead's status
export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("researching"),
      v.literal("building"),
      v.literal("presented"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("converted"),
      v.literal("won"),
      v.literal("lost"),
    ),
  },
  handler: async (ctx, { leadId, status }) => {
    await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new ConvexError({ code: "NOT_FOUND", message: "Lead not found" });
    await ctx.db.patch(leadId, { status });
  },
});

// Admin mutation - convert a factory signup to a client org
export const convertSignupToOrg = mutation({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, { leadId }) => {
    await requireAdmin(ctx);
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new ConvexError({ code: "NOT_FOUND", message: "Lead not found" });
    if (lead.factoryOrgId) throw new ConvexError({ code: "ALREADY_CONVERTED", message: "Already converted" });

    // Parse plan from notes (e.g., "Plan: growth - $149/mo")
    const planMatch = lead.notes.match(/Plan:\s*(\w+)/i);
    const plan = (planMatch?.[1] || "starter") as "starter" | "growth" | "enterprise";
    const validPlans = ["starter", "growth", "enterprise"];
    const finalPlan = validPlans.includes(plan) ? plan : "starter" as const;

    const slug = (lead.businessName || lead.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Make slug unique
    const existingSlug = await ctx.db
      .query("clientOrgs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    const finalSlug = existingSlug ? `${slug}-${Date.now().toString(36)}` : slug;

    const limits = PLAN_LIMITS[finalPlan];
    const now = Date.now();

    const orgId = await ctx.db.insert("clientOrgs", {
      name: lead.businessName || lead.name,
      slug: finalSlug,
      ownerEmail: lead.email,
      plan: finalPlan,
      status: "active",
      setupFeePaid: false,
      maxAdminUsers: limits.maxAdminUsers,
      maxFormSubmissions: limits.maxFormSubmissions,
      industry: lead.industry,
      createdAt: now,
      updatedAt: now,
    });

    // Apply plan preset features
    const features = PLAN_PRESETS[finalPlan] || [];
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

    // Link the lead to the new org and mark as won
    await ctx.db.patch(leadId, {
      factoryOrgId: orgId,
      status: "won",
    });

    return orgId;
  },
});

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

// Get linked project for a client org (admin only)
export const getLinkedProject = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, { orgId }) => {
    await requireAdmin(ctx);
    const org = await ctx.db.get(orgId);
    if (!org?.projectId) return null;
    return await ctx.db.get(org.projectId);
  },
});

// Get revenue stats for all orgs (admin only)
export const getRevenueStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const orgs = await ctx.db.query("clientOrgs").collect();

    // Plan pricing in cents
    const planPricing: Record<string, number> = {
      starter: 7900,
      growth: 14900,
      enterprise: 29900,
    };

    let totalMRR = 0;
    let activeCount = 0;
    let suspendedCount = 0;
    let setupFeesCollected = 0;

    for (const org of orgs) {
      if (org.status === "active" || org.status === "trial") {
        totalMRR += planPricing[org.plan] || 0;
        activeCount++;
      }
      if (org.status === "suspended") suspendedCount++;
      if (org.setupFeePaid && org.setupFeeAmount) {
        setupFeesCollected += org.setupFeeAmount;
      }
    }

    return {
      totalMRR,
      totalClients: orgs.length,
      activeCount,
      suspendedCount,
      setupFeesCollected,
    };
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

// Get domain-to-slug mappings for middleware routing
export const getDomainMappings = query({
  args: {},
  handler: async (ctx) => {
    const orgs = await ctx.db.query("clientOrgs").collect();
    const mappings: Record<string, string> = {};
    for (const org of orgs) {
      if (org.domain && org.status === "active") {
        mappings[org.domain] = org.slug;
        // Also map www variant
        if (!org.domain.startsWith("www.")) {
          mappings[`www.${org.domain}`] = org.slug;
        }
      }
    }
    return mappings;
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
    stripeCustomerId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find org by subscription ID first
    const orgs = await ctx.db.query("clientOrgs").collect();
    let org = orgs.find((o) => o.stripeSubscriptionId === args.stripeSubscriptionId);

    // Fallback: search by Stripe customer ID
    if (!org && args.stripeCustomerId) {
      org = await ctx.db
        .query("clientOrgs")
        .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
        .first() ?? undefined;
    }

    // Fallback: search by email
    const email = args.customerEmail;
    if (!org && email) {
      org = await ctx.db
        .query("clientOrgs")
        .withIndex("by_ownerEmail", (q) => q.eq("ownerEmail", email))
        .first() ?? undefined;
    }

    if (!org) {
      console.error(`Factory webhook: No org found for subscription ${args.stripeSubscriptionId}`);
      return;
    }

    // Update subscription ID if it wasn't set
    if (!org.stripeSubscriptionId) {
      await ctx.db.patch(org._id, { stripeSubscriptionId: args.stripeSubscriptionId, updatedAt: now });
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
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, { stripeSubscriptionId, stripeCustomerId }) => {
    const orgs = await ctx.db.query("clientOrgs").collect();
    let org = orgs.find((o) => o.stripeSubscriptionId === stripeSubscriptionId);

    // Fallback: search by customer ID
    if (!org && stripeCustomerId) {
      org = await ctx.db
        .query("clientOrgs")
        .withIndex("by_stripeCustomerId", (q) => q.eq("stripeCustomerId", stripeCustomerId))
        .first() ?? undefined;
    }
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
// Migration & Stripe Linking Mutations
// ========================================

// Migrate a project to a factory org
export const migrateProjectToFactory = mutation({
  args: {
    projectId: v.id("projects"),
    plan: v.union(v.literal("starter"), v.literal("growth"), v.literal("enterprise")),
    setupFeeAmount: v.optional(v.number()), // In cents
    monthlyAmount: v.optional(v.number()), // In cents
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new ConvexError({ code: "NOT_FOUND", message: "Project not found" });

    // Check if project already migrated
    const existingOrg = await ctx.db
      .query("clientOrgs")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first();
    if (existingOrg) {
      throw new ConvexError({ code: "ALREADY_MIGRATED", message: "This project is already linked to a factory org" });
    }

    const now = Date.now();
    const limits = PLAN_LIMITS[args.plan];
    const slug = (project.company || project.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Check slug uniqueness
    const slugExists = await ctx.db
      .query("clientOrgs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    const finalSlug = slugExists ? `${slug}-${now}` : slug;

    // Look up Stripe data by email
    const stripeCustomer = await ctx.db
      .query("stripeCustomers")
      .withIndex("by_email", (q) => q.eq("email", project.email))
      .first();

    const subscription = await ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("customerEmail"), project.email))
      .first();

    // Determine setup fee paid status
    const setupFeePaid = project.setupInvoiceStatus === "paid" ||
      project.setupInvoicePaid === true ||
      project.paymentStatus === "paid";

    // Create the org
    const orgId = await ctx.db.insert("clientOrgs", {
      name: project.company || project.name,
      slug: finalSlug,
      ownerEmail: project.email,
      plan: args.plan,
      status: "active",
      setupFeePaid,
      setupFeeAmount: args.setupFeeAmount || (project.setupFeeAmount ? project.setupFeeAmount * 100 : undefined),
      maxAdminUsers: limits.maxAdminUsers,
      maxFormSubmissions: limits.maxFormSubmissions,
      industry: undefined,
      projectId: args.projectId,
      stripeCustomerId: stripeCustomer?.stripeCustomerId,
      stripeSubscriptionId: subscription?.stripeSubscriptionId,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    // Apply plan preset features
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

// Link existing Stripe subscription to a factory org
export const linkStripeToOrg = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const org = await ctx.db.get(args.orgId);
    if (!org) throw new ConvexError({ code: "NOT_FOUND", message: "Org not found" });

    await ctx.db.patch(args.orgId, {
      stripeCustomerId: args.stripeCustomerId,
      stripeSubscriptionId: args.stripeSubscriptionId,
      updatedAt: Date.now(),
    });
  },
});

// Migrate all existing custom deal projects to factory orgs
export const migrateExistingClients = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Seed feature registry if not already done
    const existingFeature = await ctx.db.query("featureRegistry").first();
    if (!existingFeature) {
      // Will need to run seedFeatureRegistry first
      throw new ConvexError({
        code: "NO_REGISTRY",
        message: "Run seedFeatureRegistry first before migrating clients",
      });
    }

    const projects = await ctx.db.query("projects").collect();
    const customDeals = projects.filter((p) => p.isCustomDeal === true);

    const results: Array<{ name: string; orgId: string; plan: string }> = [];

    for (const project of customDeals) {
      // Skip if already migrated
      const existingOrg = await ctx.db
        .query("clientOrgs")
        .filter((q) => q.eq(q.field("projectId"), project._id))
        .first();
      if (existingOrg) continue;

      const now = Date.now();
      const plan = project.planTier === "basic" ? "starter"
        : project.planTier === "growth" ? "growth"
        : "growth"; // Default to growth

      const limits = PLAN_LIMITS[plan];
      const slug = (project.company || project.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const slugExists = await ctx.db
        .query("clientOrgs")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      const finalSlug = slugExists ? `${slug}-${now}` : slug;

      // Look up Stripe data
      const stripeCustomer = await ctx.db
        .query("stripeCustomers")
        .withIndex("by_email", (q) => q.eq("email", project.email))
        .first();

      const subscription = await ctx.db
        .query("subscriptions")
        .filter((q) => q.eq(q.field("customerEmail"), project.email))
        .first();

      const setupFeePaid = project.setupInvoiceStatus === "paid" ||
        project.setupInvoicePaid === true;

      const orgId = await ctx.db.insert("clientOrgs", {
        name: project.company || project.name,
        slug: finalSlug,
        ownerEmail: project.email,
        plan,
        status: "active",
        setupFeePaid,
        setupFeeAmount: project.setupFeeAmount ? project.setupFeeAmount * 100 : undefined,
        maxAdminUsers: limits.maxAdminUsers,
        maxFormSubmissions: limits.maxFormSubmissions,
        projectId: project._id,
        stripeCustomerId: stripeCustomer?.stripeCustomerId,
        stripeSubscriptionId: subscription?.stripeSubscriptionId,
        notes: `Migrated from project. Monthly: $${project.monthlyAmount || "N/A"}`,
        createdAt: now,
        updatedAt: now,
      });

      // Apply plan features
      const features = PLAN_PRESETS[plan] || [];
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

      results.push({ name: project.company || project.name, orgId, plan });
    }

    return { migrated: results.length, clients: results };
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

// ========================================
// Public Site Data (no auth - for rendering client sites)
// ========================================

// Get everything needed to render a client's public site
export const getPublicSiteData = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const org = await ctx.db
      .query("clientOrgs")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!org || org.status === "cancelled") return null;

    // Get enabled features
    const features = await getOrgFeatures(ctx, org._id);
    const enabledKeys = features.map((f) => f.featureKey);

    // Get all template content
    const contentRows = await ctx.db
      .query("templateContent")
      .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
      .collect();
    const content: Record<string, unknown> = {};
    for (const row of contentRows) {
      try {
        content[row.sectionKey] = JSON.parse(row.content);
      } catch {
        content[row.sectionKey] = row.content;
      }
    }

    // Get approved reviews (if reviews feature enabled)
    let reviews: Array<{
      customerName: string;
      customerLocation?: string;
      rating: number;
      text: string;
    }> = [];
    if (enabledKeys.includes("reviews")) {
      const reviewDocs = await ctx.db
        .query("templateReviews")
        .withIndex("by_orgId_status", (q) =>
          q.eq("orgId", org._id).eq("status", "approved")
        )
        .order("desc")
        .collect();
      reviews = reviewDocs.map((r) => ({
        customerName: r.customerName,
        customerLocation: r.customerLocation,
        rating: r.rating,
        text: r.text,
      }));
    }

    // Get gallery items (if gallery feature enabled)
    let galleryItems: Array<{
      imageUrl: string;
      title?: string;
      category?: string;
    }> = [];
    if (enabledKeys.includes("gallery")) {
      const items = await ctx.db
        .query("templateGalleryItems")
        .withIndex("by_orgId", (q) => q.eq("orgId", org._id))
        .collect();
      galleryItems = items
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((i) => ({
          imageUrl: i.imageUrl,
          title: i.title,
          category: i.category,
        }));
    }

    return {
      org: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        industry: org.industry,
        domain: org.domain,
        status: org.status,
      },
      enabledFeatures: enabledKeys,
      content,
      reviews,
      galleryItems,
    };
  },
});

// ========================================
// Template Content (editable per-org section content)
// ========================================

export const getTemplateContent = query({
  args: { orgId: v.id("clientOrgs"), sectionKey: v.string() },
  handler: async (ctx, { orgId, sectionKey }) => {
    const row = await ctx.db
      .query("templateContent")
      .withIndex("by_orgId_sectionKey", (q) =>
        q.eq("orgId", orgId).eq("sectionKey", sectionKey)
      )
      .first();
    if (!row) return null;
    return JSON.parse(row.content);
  },
});

export const getAllTemplateContent = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, { orgId }) => {
    const rows = await ctx.db
      .query("templateContent")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.sectionKey] = JSON.parse(row.content);
    }
    return result;
  },
});

export const updateTemplateContent = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    sectionKey: v.string(),
    content: v.string(), // JSON stringified
  },
  handler: async (ctx, { orgId, sectionKey, content }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("templateContent")
      .withIndex("by_orgId_sectionKey", (q) =>
        q.eq("orgId", orgId).eq("sectionKey", sectionKey)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { content, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("templateContent", {
        orgId,
        sectionKey,
        content,
        updatedAt: Date.now(),
      });
    }
  },
});

// ========================================
// Template Blog Posts (Growth tier)
// ========================================

export const listBlogPosts = query({
  args: { orgId: v.id("clientOrgs"), status: v.optional(v.string()) },
  handler: async (ctx, { orgId, status }) => {
    if (status) {
      return await ctx.db
        .query("templateBlogPosts")
        .withIndex("by_orgId_status", (q) =>
          q.eq("orgId", orgId).eq("status", status as "draft" | "published")
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("templateBlogPosts")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

export const getBlogPost = query({
  args: { orgId: v.id("clientOrgs"), slug: v.string() },
  handler: async (ctx, { orgId, slug }) => {
    return await ctx.db
      .query("templateBlogPosts")
      .withIndex("by_orgId_slug", (q) => q.eq("orgId", orgId).eq("slug", slug))
      .first();
  },
});

export const createBlogPost = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireFeature(ctx, args.orgId, "blog");
    const now = Date.now();
    return await ctx.db.insert("templateBlogPosts", {
      ...args,
      publishedAt: args.status === "published" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBlogPost = mutation({
  args: {
    postId: v.id("templateBlogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  handler: async (ctx, { postId, ...updates }) => {
    await requireAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (!post) throw new ConvexError("Blog post not found");
    await requireFeature(ctx, post.orgId, "blog");

    const patch: Record<string, unknown> = { ...updates, updatedAt: Date.now() };
    if (updates.status === "published" && post.status !== "published") {
      patch.publishedAt = Date.now();
    }
    await ctx.db.patch(postId, patch);
  },
});

export const deleteBlogPost = mutation({
  args: { postId: v.id("templateBlogPosts") },
  handler: async (ctx, { postId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(postId);
  },
});

// ========================================
// Template Reviews (Growth tier)
// ========================================

export const listReviews = query({
  args: { orgId: v.id("clientOrgs"), status: v.optional(v.string()) },
  handler: async (ctx, { orgId, status }) => {
    if (status) {
      return await ctx.db
        .query("templateReviews")
        .withIndex("by_orgId_status", (q) =>
          q.eq("orgId", orgId).eq("status", status as "pending" | "approved" | "rejected")
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("templateReviews")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

export const submitReview = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    customerName: v.string(),
    customerLocation: v.optional(v.string()),
    rating: v.number(),
    text: v.string(),
    serviceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireFeature(ctx, args.orgId, "reviews");
    return await ctx.db.insert("templateReviews", {
      ...args,
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

export const moderateReview = mutation({
  args: {
    reviewId: v.id("templateReviews"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, { reviewId, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(reviewId, {
      status,
      approvedAt: status === "approved" ? Date.now() : undefined,
    });
  },
});

// ========================================
// Template Bookings (Growth tier)
// ========================================

export const listBookings = query({
  args: { orgId: v.id("clientOrgs"), status: v.optional(v.string()) },
  handler: async (ctx, { orgId, status }) => {
    if (status) {
      return await ctx.db
        .query("templateBookings")
        .withIndex("by_orgId_status", (q) =>
          q.eq("orgId", orgId).eq("status", status as "pending" | "confirmed" | "cancelled" | "completed")
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("templateBookings")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

export const createBooking = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    serviceType: v.string(),
    preferredDate: v.string(),
    preferredTime: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireFeature(ctx, args.orgId, "booking");
    const now = Date.now();
    return await ctx.db.insert("templateBookings", {
      ...args,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("templateBookings"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, { bookingId, status }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(bookingId, { status, updatedAt: Date.now() });
  },
});

// ========================================
// Template Gallery Items (Starter tier)
// ========================================

export const listGalleryItems = query({
  args: { orgId: v.id("clientOrgs"), category: v.optional(v.string()) },
  handler: async (ctx, { orgId, category }) => {
    if (category) {
      return await ctx.db
        .query("templateGalleryItems")
        .withIndex("by_orgId_category", (q) =>
          q.eq("orgId", orgId).eq("category", category)
        )
        .collect();
    }
    return await ctx.db
      .query("templateGalleryItems")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();
  },
});

export const addGalleryItem = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    imageUrl: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, { sortOrder, ...args }) => {
    await requireAdmin(ctx);
    await requireFeature(ctx, args.orgId, "gallery");
    return await ctx.db.insert("templateGalleryItems", {
      ...args,
      sortOrder: sortOrder ?? 0,
      createdAt: Date.now(),
    });
  },
});

export const deleteGalleryItem = mutation({
  args: { itemId: v.id("templateGalleryItems") },
  handler: async (ctx, { itemId }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(itemId);
  },
});

// ========================================
// Template Newsletter Subscribers (Growth tier)
// ========================================

export const subscribeNewsletter = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireFeature(ctx, args.orgId, "newsletter");
    // Check if already subscribed
    const existing = await ctx.db
      .query("templateSubscribers")
      .withIndex("by_orgId_email", (q) =>
        q.eq("orgId", args.orgId).eq("email", args.email)
      )
      .first();
    if (existing) {
      if (existing.status === "unsubscribed") {
        await ctx.db.patch(existing._id, {
          status: "active",
          subscribedAt: Date.now(),
          unsubscribedAt: undefined,
        });
      }
      return existing._id;
    }
    return await ctx.db.insert("templateSubscribers", {
      ...args,
      subscribedAt: Date.now(),
      status: "active",
    });
  },
});

export const listSubscribers = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, { orgId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("templateSubscribers")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();
  },
});

// ========================================
// Template Portal Users (Enterprise tier)
// ========================================

export const listPortalUsers = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, { orgId }) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("templatePortalUsers")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .collect();
  },
});

export const createPortalUser = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireFeature(ctx, args.orgId, "client_portal");
    return await ctx.db.insert("templatePortalUsers", {
      ...args,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

// ========================================
// Template Documents (Enterprise tier)
// ========================================

export const listDocuments = query({
  args: { orgId: v.id("clientOrgs"), type: v.optional(v.string()) },
  handler: async (ctx, { orgId, type }) => {
    if (type) {
      return await ctx.db
        .query("templateDocuments")
        .withIndex("by_orgId_type", (q) =>
          q.eq("orgId", orgId).eq("type", type as "invoice" | "contract" | "proposal" | "receipt")
        )
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("templateDocuments")
      .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
      .order("desc")
      .collect();
  },
});

export const createDocument = mutation({
  args: {
    orgId: v.id("clientOrgs"),
    portalUserId: v.optional(v.id("templatePortalUsers")),
    title: v.string(),
    type: v.union(
      v.literal("invoice"),
      v.literal("contract"),
      v.literal("proposal"),
      v.literal("receipt")
    ),
    fileUrl: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("signed")
    )),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await requireFeature(ctx, args.orgId, "client_portal");
    const now = Date.now();
    return await ctx.db.insert("templateDocuments", {
      ...args,
      status: args.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

// ---- Publish / Unpublish Site ----
export const publishSite = mutation({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const org = await ctx.db.get(args.orgId);
    if (!org) throw new ConvexError({ code: "NOT_FOUND", message: "Org not found" });
    await ctx.db.patch(args.orgId, {
      publishedAt: org.publishedAt ? undefined : Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// ---- Org Stats (counts for modules) ----
export const getOrgStats = query({
  args: { orgId: v.id("clientOrgs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const [blogPosts, reviews, bookings, gallery, subscribers] = await Promise.all([
      ctx.db.query("templateBlogPosts").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect(),
      ctx.db.query("templateReviews").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect(),
      ctx.db.query("templateBookings").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect(),
      ctx.db.query("templateGalleryItems").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect(),
      ctx.db.query("templateSubscribers").withIndex("by_orgId", (q) => q.eq("orgId", args.orgId)).collect(),
    ]);
    return {
      blogCount: blogPosts.length,
      reviewCount: reviews.length,
      pendingReviews: reviews.filter((r) => r.status !== "approved").length,
      bookingCount: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === "pending").length,
      galleryCount: gallery.length,
      subscriberCount: subscribers.length,
    };
  },
});
