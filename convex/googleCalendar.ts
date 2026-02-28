import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

export const saveTokens = mutation({
  args: {
    accessToken: v.optional(v.string()),
    refreshToken: v.string(),
    expiryDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("googleTokens")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("googleTokens", {
        key: "main",
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiryDate: args.expiryDate,
        updatedAt: Date.now(),
      });
    }
  },
});

export const getTokens = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("googleTokens")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
  },
});

export const getConnectionStatus = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const tokens = await ctx.db
      .query("googleTokens")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    return !!tokens?.refreshToken;
  },
});

export const disconnectCalendar = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("googleTokens")
      .withIndex("by_key", (q) => q.eq("key", "main"))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
