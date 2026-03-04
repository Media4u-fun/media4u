import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "../_generated/dataModel";

/**
 * Feature middleware for gating Convex functions behind feature flags.
 *
 * HOW TO USE:
 *
 * 1. In any query/mutation that belongs to a feature module, call this
 *    at the top of the handler to verify the org has access:
 *
 *    export const getMapData = query({
 *      args: { orgId: v.id("clientOrgs") },
 *      handler: async (ctx, { orgId }) => {
 *        await requireOrgFeature(ctx, orgId, "mapping");
 *        // ... rest of your logic
 *      },
 *    });
 *
 * 2. For functions where the org is determined by the logged-in user:
 *
 *    export const getMyBookings = query({
 *      args: {},
 *      handler: async (ctx) => {
 *        const orgId = await resolveUserOrg(ctx);
 *        await requireOrgFeature(ctx, orgId, "booking");
 *        // ... rest of your logic
 *      },
 *    });
 */

/**
 * Verify an org has a specific feature enabled.
 * Throws ConvexError if the feature is not enabled.
 */
export async function requireOrgFeature(
  ctx: QueryCtx | MutationCtx,
  orgId: Id<"clientOrgs">,
  featureKey: string
): Promise<void> {
  // Check org exists and is active
  const org = await ctx.db.get(orgId);
  if (!org) {
    throw new ConvexError({
      code: "NOT_FOUND",
      message: "Organization not found",
    });
  }
  if (org.status !== "active" && org.status !== "trial") {
    throw new ConvexError({
      code: "ORG_SUSPENDED",
      message: "Your account is suspended. Please contact support.",
    });
  }

  // Check feature is enabled
  const feature = await ctx.db
    .query("orgFeatures")
    .withIndex("by_orgId_featureKey", (q) =>
      q.eq("orgId", orgId).eq("featureKey", featureKey)
    )
    .first();

  if (!feature || !feature.enabled) {
    throw new ConvexError({
      code: "FEATURE_DISABLED",
      message: `This feature is not included in your current plan.`,
      featureKey,
    });
  }

  // Check trial expiry
  if (feature.source === "trial" && feature.trialEndsAt) {
    if (Date.now() > feature.trialEndsAt) {
      throw new ConvexError({
        code: "TRIAL_EXPIRED",
        message: `Your free trial for this feature has ended. Upgrade to keep using it.`,
        featureKey,
      });
    }
  }

  // Check usage limits if applicable
  if (feature.usageLimit && feature.usageCurrent) {
    if (feature.usageCurrent >= feature.usageLimit) {
      throw new ConvexError({
        code: "USAGE_LIMIT",
        message: `You've reached your usage limit for this feature. Upgrade for more.`,
        featureKey,
        limit: feature.usageLimit,
        current: feature.usageCurrent,
      });
    }
  }
}

/**
 * Check if an org has a feature (returns boolean, doesn't throw).
 * Useful for conditional logic instead of hard blocking.
 */
export async function checkOrgFeature(
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

  if (feature.source === "trial" && feature.trialEndsAt) {
    if (Date.now() > feature.trialEndsAt) return false;
  }

  return true;
}

/**
 * Increment usage counter for a feature (call after each use).
 * Only increments if the feature has a usage limit set.
 */
export async function incrementFeatureUsage(
  ctx: MutationCtx,
  orgId: Id<"clientOrgs">,
  featureKey: string
): Promise<void> {
  const feature = await ctx.db
    .query("orgFeatures")
    .withIndex("by_orgId_featureKey", (q) =>
      q.eq("orgId", orgId).eq("featureKey", featureKey)
    )
    .first();

  if (feature && feature.usageLimit) {
    await ctx.db.patch(feature._id, {
      usageCurrent: (feature.usageCurrent || 0) + 1,
      updatedAt: Date.now(),
    });
  }
}

/**
 * Resolve the org ID from the currently logged-in user.
 * Throws if user is not logged in or has no org.
 */
export async function resolveUserOrg(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"clientOrgs">> {
  // Import dynamically to avoid circular deps
  const { getAuthenticatedUser } = await import("../auth");
  const user = await getAuthenticatedUser(ctx);

  if (!user) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "You must be logged in",
    });
  }

  const org = await ctx.db
    .query("clientOrgs")
    .withIndex("by_ownerUserId", (q) => q.eq("ownerUserId", user._id))
    .first();

  if (!org) {
    throw new ConvexError({
      code: "NO_ORG",
      message: "No organization found for your account",
    });
  }

  return org._id;
}
