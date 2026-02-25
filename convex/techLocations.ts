import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Report tech's current GPS location (called every 30 seconds during active job)
export const reportLocation = mutation({
  args: {
    techId: v.string(),
    techName: v.string(),
    jobId: v.id("jobs"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, { techId, techName, jobId, latitude, longitude }) => {
    // Check if there's already a location record for this tech
    const existing = await ctx.db
      .query("techLocations")
      .withIndex("by_techId", (q) => q.eq("techId", techId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        jobId,
        latitude,
        longitude,
        timestamp: Date.now(),
      });
    } else {
      await ctx.db.insert("techLocations", {
        techId,
        techName,
        jobId,
        latitude,
        longitude,
        timestamp: Date.now(),
      });
    }
  },
});

// Remove tech's location (called when they stop tracking / complete a job)
export const removeLocation = mutation({
  args: {
    techId: v.string(),
  },
  handler: async (ctx, { techId }) => {
    const existing = await ctx.db
      .query("techLocations")
      .withIndex("by_techId", (q) => q.eq("techId", techId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
