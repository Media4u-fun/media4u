import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get site settings
export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "site_config"))
      .first();

    // Return settings or defaults
    return settings || {
      instagramUrl: "",
      facebookUrl: "",
      tiktokUrl: "",
      linkedinUrl: "",
      contactEmail: "",
      whatsappNumber: "",
    };
  },
});

// Update site settings
export const updateSettings = mutation({
  args: {
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if settings exist
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "site_config"))
      .first();

    if (existing) {
      // Update existing settings
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      // Create new settings
      await ctx.db.insert("siteSettings", {
        key: "site_config",
        ...args,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
