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
    businessName: v.optional(v.string()),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()), // "Phoenix, AZ"
    industry: v.optional(v.string()), // "Door Company", "Pool Service", etc.
    website: v.optional(v.string()),
    source: v.string(),
    notes: v.string(),
    photos: v.optional(v.array(v.id("_storage"))), // Uploaded photo IDs
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      name: args.name,
      businessName: args.businessName,
      email: args.email,
      company: args.company,
      phone: args.phone,
      location: args.location,
      industry: args.industry,
      website: args.website,
      source: args.source,
      status: "new",
      notes: args.notes,
      photos: args.photos,
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
    businessName: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    industry: v.optional(v.string()),
    website: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("researching"),
        v.literal("building"),
        v.literal("presented"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("converted"),
        v.literal("won"),
        v.literal("lost")
      )
    ),
    notes: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
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

// Generate upload URL for lead photos
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Get photo URL from storage ID
export const getPhotoUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
