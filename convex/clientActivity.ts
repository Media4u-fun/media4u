import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./auth";

// Get all unread activity count (for badge)
export const getUnreadCount = query({
  handler: async (ctx) => {
    const unreadActivities = await ctx.db
      .query("clientActivity")
      .withIndex("by_read", (q) => q.eq("read", false))
      .collect();

    return unreadActivities.length;
  },
});

// Get all client activities (newest first)
export const getAllActivities = query({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const activities = await ctx.db
      .query("clientActivity")
      .order("desc")
      .take(100); // Limit to last 100 activities

    // Get project info for each activity
    const activitiesWithProject = await Promise.all(
      activities.map(async (activity) => {
        const project = await ctx.db.get(activity.projectId);
        return {
          ...activity,
          projectName: project?.name,
          projectType: project?.projectType,
        };
      })
    );

    return activitiesWithProject;
  },
});

// Get activities for a specific project
export const getProjectActivities = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("clientActivity")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    return activities;
  },
});

// Log a client activity
export const logActivity = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.string(),
    userName: v.string(),
    activityType: v.union(
      v.literal("vault_updated"),
      v.literal("note_added"),
      v.literal("project_updated")
    ),
    description: v.string(),
    metadata: v.optional(v.object({
      fieldName: v.optional(v.string()),
      oldValue: v.optional(v.string()),
      newValue: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("clientActivity", {
      projectId: args.projectId,
      userId: args.userId,
      userName: args.userName,
      activityType: args.activityType,
      description: args.description,
      metadata: args.metadata,
      read: false,
      createdAt: Date.now(),
    });

    return activityId;
  },
});

// Mark activity as read
export const markAsRead = mutation({
  args: { id: v.id("clientActivity") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, {
      read: true,
    });

    return { success: true };
  },
});

// Mark all activities as read
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const unreadActivities = await ctx.db
      .query("clientActivity")
      .withIndex("by_read", (q) => q.eq("read", false))
      .collect();

    await Promise.all(
      unreadActivities.map((activity) =>
        ctx.db.patch(activity._id, { read: true })
      )
    );

    return { success: true, count: unreadActivities.length };
  },
});

// Delete an activity
export const deleteActivity = mutation({
  args: { id: v.id("clientActivity") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// Clear old read activities (cleanup - older than 30 days)
export const clearOldActivities = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const oldActivities = await ctx.db
      .query("clientActivity")
      .withIndex("by_created", (q) => q.lt("createdAt", thirtyDaysAgo))
      .collect();

    const oldReadActivities = oldActivities.filter((a) => a.read);

    await Promise.all(
      oldReadActivities.map((activity) => ctx.db.delete(activity._id))
    );

    return { success: true, count: oldReadActivities.length };
  },
});
