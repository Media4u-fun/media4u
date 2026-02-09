import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { ConvexError } from "convex/values";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Authorization helper - verifies user is authenticated and has admin role.
 * Throws ConvexError if unauthorized (industry standard pattern).
 * Use this at the start of any admin-only mutation or action.
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  let user;
  try {
    user = await authComponent.getAuthUser(ctx);
  } catch {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  if (!user) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_userId", (q) => q.eq("userId", user._id))
    .first();

  if (userRole?.role !== "admin") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Admin access required" });
  }

  return user;
}

/**
 * Get authenticated user or null (doesn't throw).
 * Use for optional auth checks.
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  try {
    return await authComponent.getAuthUser(ctx);
  } catch {
    return null;
  }
}

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      crossDomain({ siteUrl }),
      convex({ authConfig }),
    ],
  });
};

export type Auth = ReturnType<typeof createAuth>;

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx);
    } catch {
      return null;
    }
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    try {
      const user = await authComponent.getAuthUser(ctx);
      if (!user) return false;

      // Check userRoles table for admin role
      const userRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .first();

      return userRole?.role === "admin";
    } catch {
      // User not authenticated
      return false;
    }
  },
});

// Public query to check admin by user ID (for client-side checks)
export const checkAdminByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return userRole?.role === "admin";
  },
});

// Get user role by user ID
export const getUserRole = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return userRole?.role ?? "user";
  },
});

// Set user role (admin only)
export const setUserRole = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, { userId, role }) => {
    // Verify caller is admin
    await requireAdmin(ctx);

    // Check if role already exists
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role });
    } else {
      await ctx.db.insert("userRoles", {
        userId,
        role,
        createdAt: Date.now(),
      });
    }
  },
});
