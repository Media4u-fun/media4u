import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

/**
 * DEV ONLY: Make a user admin without requiring existing admin
 *
 * Usage in Convex dashboard:
 * 1. Sign up a user in your app
 * 2. Run debugAuth to see your current user ID and role
 * 3. Run makeAdmin with your userId if needed
 *
 * DELETE THIS FILE before deploying to production!
 */

export const debugAuth = query({
  handler: async (ctx) => {
    // Get current authenticated user
    let currentUser;
    try {
      currentUser = await authComponent.getAuthUser(ctx);
    } catch {
      currentUser = null;
    }

    // Get all user roles
    const userRoles = await ctx.db.query("userRoles").collect();

    // Find role for current user
    const currentUserRole = currentUser
      ? userRoles.find((r) => r.userId === currentUser._id)
      : null;

    return {
      currentUser: currentUser ? {
        id: currentUser._id,
        email: currentUser.email,
        name: currentUser.name,
      } : null,
      currentUserRole: currentUserRole ?? "No role found",
      allUserRoles: userRoles,
      helpMessage: currentUser && !currentUserRole
        ? `Run makeAdmin with userId: "${currentUser._id}"`
        : null,
    };
  },
});

export const listAllUsers = query({
  handler: async (ctx) => {
    const userRoles = await ctx.db.query("userRoles").collect();
    return userRoles;
  },
});

export const makeAdmin = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, { userId }) => {
    // Check if role already exists
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      // Update existing role
      await ctx.db.patch(existing._id, { role: "admin" });
      return {
        success: true,
        message: `Updated user ${userId} to admin`,
        action: "updated"
      };
    } else {
      // Create new role
      await ctx.db.insert("userRoles", {
        userId,
        role: "admin",
        createdAt: Date.now(),
      });
      return {
        success: true,
        message: `Created admin role for user ${userId}`,
        action: "created"
      };
    }
  },
});

export const makeUser = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, { userId }) => {
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: "user" });
      return { success: true, message: `Updated user ${userId} to regular user` };
    } else {
      await ctx.db.insert("userRoles", {
        userId,
        role: "user",
        createdAt: Date.now(),
      });
      return { success: true, message: `Created user role for ${userId}` };
    }
  },
});
