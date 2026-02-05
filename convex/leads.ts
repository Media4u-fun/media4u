import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all leads (sorted by creation date, newest first)
export const getAllLeads = query({
  handler: async (ctx) => {
    const leads = await ctx.db
      .query("leads")
      .order("desc")
      .collect();
    return leads;
  },
});

// Get a single lead by ID
export const getLeadById = query({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.id);
    return lead;
  },
});

// Create a new lead
export const createLead = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.string(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      name: args.name,
      email: args.email,
      company: args.company,
      phone: args.phone,
      source: args.source,
      status: "new",
      notes: args.notes,
      createdAt: Date.now(),
      lastContactedAt: undefined,
    });
    return leadId;
  },
});

// Update an existing lead
export const updateLead = mutation({
  args: {
    id: v.id("leads"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("converted"),
        v.literal("lost")
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete a lead
export const deleteLead = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Update last contacted timestamp (called after sending email)
export const updateLastContacted = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      lastContactedAt: Date.now(),
      status: "contacted",
    });
  },
});
