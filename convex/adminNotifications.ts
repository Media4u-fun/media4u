import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { requireAdmin } from "./auth";

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
    } catch {
      return 0;
    }
    const unread = await ctx.db
      .query("adminNotifications")
      .withIndex("by_read", (q) => q.eq("isRead", false))
      .collect();
    return unread.length;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("adminNotifications")
      .withIndex("by_created")
      .order("desc")
      .take(50);
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("adminNotifications") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const unread = await ctx.db
      .query("adminNotifications")
      .withIndex("by_read", (q) => q.eq("isRead", false))
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id("adminNotifications") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.notificationId);
  },
});

// Internal - called by the reminder scheduler
export const createNotification = internalMutation({
  args: {
    type: v.string(),
    title: v.string(),
    message: v.string(),
    appointmentId: v.optional(v.id("appointments")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("adminNotifications", {
      type: args.type,
      title: args.title,
      message: args.message,
      appointmentId: args.appointmentId,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});
