import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all unassigned jobs grouped by state/city for the Route Planner
export const getUnassignedJobsByRegion = query({
  handler: async (ctx) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "unassigned"))
      .collect();

    return jobs;
  },
});

// Update job status (tech can change their own job status)
export const updateJobStatus = mutation({
  args: {
    id: v.id("jobs"),
    status: v.union(
      v.literal("in_progress"),
      v.literal("waiting_pickup"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});

// Update ticket fields parsed from pasted ticket text
export const updateTicketFields = mutation({
  args: {
    id: v.id("jobs"),
    serviceTicketNumber: v.optional(v.string()),
    description: v.optional(v.string()),
    specialInstructions: v.optional(v.string()),
    startTime: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    // Only patch fields that were provided
    const updates: Record<string, string> = {};
    if (fields.serviceTicketNumber) updates.serviceTicketNumber = fields.serviceTicketNumber;
    if (fields.description) updates.description = fields.description;
    if (fields.specialInstructions) updates.specialInstructions = fields.specialInstructions;
    if (fields.startTime) updates.startTime = fields.startTime;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(id, updates);
    }
  },
});
