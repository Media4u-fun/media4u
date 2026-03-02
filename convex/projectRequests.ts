import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// Public - anyone can submit a project request
export const submitProjectRequest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    businessName: v.optional(v.string()),
    projectTypes: v.array(v.string()),
    description: v.string(),
    timeline: v.string(),
    budget: v.string(),
    // Enhanced Build Path fields
    vision: v.optional(v.string()),
    primaryGoal: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    lookAndFeel: v.optional(v.string()),
    growthStage: v.optional(v.string()),
    optionalEnhancements: v.optional(v.array(v.string())),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("projectRequests", {
      name: args.name,
      email: args.email,
      businessName: args.businessName,
      projectTypes: args.projectTypes,
      description: args.description,
      timeline: args.timeline,
      budget: args.budget,
      status: "new",
      createdAt: Date.now(),
      // Enhanced Build Path fields
      vision: args.vision,
      primaryGoal: args.primaryGoal,
      features: args.features,
      lookAndFeel: args.lookAndFeel,
      growthStage: args.growthStage,
      optionalEnhancements: args.optionalEnhancements,
      userId: args.userId,
    });

    return id;
  },
});

// Admin only - view project requests
export const getProjectRequests = query({
  args: {
    status: v.optional(v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("declined")
    )),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      return await ctx.db
        .query("projectRequests")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("projectRequests")
      .order("desc")
      .collect();
  },
});

// Admin only - update project status
export const updateProjectStatus = mutation({
  args: {
    id: v.id("projectRequests"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("quoted"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const updates: Record<string, string | undefined> = { status: args.status };
    if (args.notes !== undefined) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Admin only - delete project request
export const deleteProjectRequest = mutation({
  args: {
    id: v.id("projectRequests"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
  },
});
