import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

export const subscribeToNewsletter = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Normalize email to lowercase to prevent duplicates
    const normalizedEmail = args.email.toLowerCase().trim();

    // Check if email already exists (case insensitive)
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    if (existing) {
      // If already subscribed but unsubscribed, resubscribe
      if (existing.unsubscribed) {
        await ctx.db.patch(existing._id, {
          unsubscribed: false,
          subscribedAt: Date.now(),
        });
        return { success: true, id: existing._id, newSubscription: false };
      }
      // Already subscribed
      return { success: false, error: "Email already subscribed", id: existing._id };
    }

    // Create new subscription with normalized email
    const id = await ctx.db.insert("newsletterSubscribers", {
      email: normalizedEmail,
      subscribedAt: Date.now(),
      unsubscribed: false,
    });

    return { success: true, id, newSubscription: true };
  },
});

export const getNewsletterSubscribers = query({
  args: {
    unsubscribedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try { await requireAdmin(ctx); } catch { return []; }
    const baseQuery = ctx.db.query("newsletterSubscribers");

    const filteredQuery = args.unsubscribedOnly
      ? baseQuery.withIndex("by_subscribed", (q) => q.eq("unsubscribed", true))
      : baseQuery;

    return await filteredQuery.collect();
  },
});

export const unsubscribeFromNewsletter = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscriber = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!subscriber) {
      return { success: false, error: "Email not found" };
    }

    await ctx.db.patch(subscriber._id, {
      unsubscribed: true,
    });

    return { success: true };
  },
});

export const getSubscriberCount = query({
  handler: async (ctx) => {
    try { await requireAdmin(ctx); } catch { return 0; }
    const subscribers = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_subscribed", (q) => q.eq("unsubscribed", false))
      .collect();

    return subscribers.length;
  },
});
