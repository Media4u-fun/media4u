import { query, internalMutation } from "./_generated/server";
import { requireAdmin } from "./auth";
import { v } from "convex/values";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all users from Better Auth (users table is managed by Better Auth component)
    // TypeScript doesn't know about Better Auth tables, so we use type assertion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allUsers = await (ctx.db as any).query("users").collect();

    // Get all user roles
    const userRoles = await ctx.db.query("userRoles").collect();

    // Create a map of userId to role for quick lookup
    const roleMap = new Map(userRoles.map(r => [r.userId, r.role]));

    // Combine user data with roles
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return allUsers.map((user: any) => ({
      _id: user._id,
      name: user.name || "Unknown",
      email: user.email || "No email",
      role: roleMap.get(user._id) || "user",
    }));
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

