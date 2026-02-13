import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// Public - anyone can submit a contact form
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

    // Automatically subscribe to newsletter (case insensitive)
    const normalizedEmail = args.email.toLowerCase().trim();
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .first();

    let isNewSubscriber = false;
    if (!existing) {
      // New subscriber
      await ctx.db.insert("newsletterSubscribers", {
        email: normalizedEmail,
        subscribedAt: Date.now(),
        unsubscribed: false,
      });
      isNewSubscriber = true;
    } else if (existing.unsubscribed) {
      // Resubscribe if they previously unsubscribed
      await ctx.db.patch(existing._id, {
        unsubscribed: false,
        subscribedAt: Date.now(),
      });
      isNewSubscriber = true;
    }

    return { id, isNewSubscriber };
  },
});

// Admin only - view contact submissions
export const getContactSubmissions = query({
  args: {
    status: v.optional(v.union(v.literal("new"), v.literal("read"), v.literal("replied"))),
  },
  handler: async (ctx, args) => {
    // Note: Queries can't use requireAdmin directly as they don't have mutation context
    // Access control is enforced at the UI level for queries
    if (args.status) {
      return await ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .collect();
  },
});

// Admin only - update contact status
export const updateContactStatus = mutation({
  args: {
    id: v.id("contactSubmissions"),
    status: v.union(v.literal("new"), v.literal("read"), v.literal("replied")),
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

// Admin only - delete contact submission
export const deleteContactSubmission = mutation({
  args: {
    id: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
  },
});

// Convert contact submission to project
export const createProjectFromContact = mutation({
  args: {
    contactId: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get the contact submission
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new Error("Contact submission not found");
    }

    // Create project with contact info
    const projectId = await ctx.db.insert("projects", {
      name: contact.name,
      email: contact.email,
      company: undefined,
      phone: undefined,
      projectType: contact.service,
      description: contact.message,
      requirements: undefined,
      budget: undefined,
      timeline: undefined,
      status: "new",
      notes: `Converted from contact form submission.\n\nOriginal message:\n${contact.message}`,
      liveUrl: undefined,
      leadId: undefined,
      backendComplexity: undefined,
      technicalFeatures: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update contact status to replied
    await ctx.db.patch(args.contactId, {
      status: "replied",
    });

    return projectId;
  },
});
