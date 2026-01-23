import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submitContact = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    service: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      service: args.service,
      message: args.message,
      status: "new",
      createdAt: Date.now(),
    });

    return id;
  },
});

export const getContactSubmissions = query({
  args: {
    status: v.optional(v.union(v.literal("new"), v.literal("read"), v.literal("replied"))),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .collect();
  },
});

export const updateContactStatus = mutation({
  args: {
    id: v.id("contactSubmissions"),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
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

export const deleteContactSubmission = mutation({
  args: {
    id: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
