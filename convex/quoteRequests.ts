import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new quote request
export const createQuoteRequest = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    serviceType: v.string(),
    issueType: v.string(),
    propertyType: v.string(),
    zipCode: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("quoteRequests", {
      name: args.name,
      phone: args.phone,
      email: args.email,
      serviceType: args.serviceType,
      issueType: args.issueType,
      propertyType: args.propertyType,
      zipCode: args.zipCode,
      description: args.description,
      status: "new",
      createdAt: Date.now(),
    });
    return id;
  },
});

// Get all quote requests (for admin)
export const getAllQuoteRequests = query({
  args: {
    serviceType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.serviceType) {
      return await ctx.db
        .query("quoteRequests")
        .withIndex("by_serviceType", (q) => q.eq("serviceType", args.serviceType!))
        .order("desc")
        .collect();
    }
    return await ctx.db
      .query("quoteRequests")
      .order("desc")
      .collect();
  },
});

// Update quote request status
export const updateQuoteRequestStatus = mutation({
  args: {
    id: v.id("quoteRequests"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("quoted"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Delete quote request
export const deleteQuoteRequest = mutation({
  args: {
    id: v.id("quoteRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
