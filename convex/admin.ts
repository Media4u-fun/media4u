import { query, mutation, internalMutation } from "./_generated/server";
import { requireAdmin } from "./auth";
import { v } from "convex/values";
import { components } from "./_generated/api";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all user roles
    const userRoles = await ctx.db.query("userRoles").collect();

    // Fetch user details from Better Auth for each user with a role
    const usersWithDetails = await Promise.all(
      userRoles.map(async (roleRecord) => {
        try {
          // Query Better Auth user table to get name and email
          const authUser = await ctx.runQuery(components.betterAuth.adapter.findOne, {
            model: "user",
            where: [{ field: "id", value: roleRecord.userId, operator: "eq" }],
          });

          return {
            _id: roleRecord.userId,
            name: authUser?.name || `User ${roleRecord.userId.slice(-8)}`,
            email: authUser?.email || roleRecord.userId,
            role: roleRecord.role,
          };
        } catch {
          // Fallback if user not found in Better Auth
          return {
            _id: roleRecord.userId,
            name: `User ${roleRecord.userId.slice(-8)}`,
            email: roleRecord.userId,
            role: roleRecord.role,
          };
        }
      })
    );

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
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
    } else {
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        createdAt: Date.now(),
      });
    }
  },
});

export const addUserByEmail = mutation({
  args: {
    userId: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if they already have a role
    const existing = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update existing role
      await ctx.db.patch(existing._id, { role: args.role });
      return { success: true, message: `Updated user to ${args.role}` };
    } else {
      // Create new role entry
      await ctx.db.insert("userRoles", {
        userId: args.userId,
        role: args.role,
        createdAt: Date.now(),
      });
      return { success: true, message: `Added user as ${args.role}` };
    }
  },
});

