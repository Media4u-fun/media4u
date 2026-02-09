import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./auth";
import { v } from "convex/values";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all user roles (now includes email and name)
    const userRoles = await ctx.db.query("userRoles").collect();

    // Map to user details using stored email/name
    const usersWithDetails = userRoles.map((roleRecord) => {
      return {
        _id: roleRecord.userId,
        name: roleRecord.displayName || roleRecord.name || `User ${roleRecord.userId.slice(-8)}`,
        email: roleRecord.email || `No email stored`,
        role: roleRecord.role,
      };
    });

    return usersWithDetails;
  },
});

export const getAllUserRoles = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("userRoles").collect();
  },
});

export const checkAdminAccess = internalMutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
  },
});

export const setUserRoleInternal = internalMutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        ...(args.email && { email: args.email }),
        ...(args.name && { name: args.name }),
      });
    } else {
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        email: args.email,
        name: args.name,
        createdAt: Date.now(),
      });
    }
  },
});

export const addUserByEmail = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if they already have a role
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update existing role and optionally email/name
      await ctx.db.patch(existing._id, {
        role: args.role,
        ...(args.email && { email: args.email }),
        ...(args.name && { name: args.name }),
      });
      return { success: true, message: `Updated user to ${args.role}` };
    } else {
      // Create new role entry
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        email: args.email,
        name: args.name,
        createdAt: Date.now(),
      });
      return { success: true, message: `Added user as ${args.role}` };
    }
  },
});

// Update user display name (admin only)
export const updateUserName = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Find the user's role record
    const roleRecord = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!roleRecord) {
      throw new Error("User not found");
    }

    // Update the display name in our table
    await ctx.db.patch(roleRecord._id, { displayName: args.name });

    return { success: true, message: `Updated name to ${args.name}` };
  },
});

