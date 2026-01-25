import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitProjectRequest = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    businessName: v.optional(v.string()),
    projectTypes: v.array(v.string()),
    description: v.string(),
    timeline: v.string(),
    budget: v.string(),
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
    });

    return id;
  },
});

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
    const updates: Record<string, string | undefined> = { status: args.status };
    if (args.notes !== undefined) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const deleteProjectRequest = mutation({
  args: {
    id: v.id("projectRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
