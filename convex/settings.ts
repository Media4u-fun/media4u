import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// Get site settings
export const getSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "site_config"))
      .first();

    // Return settings or defaults
    return settings || {
      companyName: "Media4U",
      contactEmail: "support@media4u.fun",
      phoneNumber: "",
      instagramUrl: "",
      facebookUrl: "",
      tiktokUrl: "",
      linkedinUrl: "",
      twitterUrl: "",
      youtubeUrl: "",
      whatsappNumber: "",
      maintenanceMode: false,
      emailNotifications: true,
    };
  },
});

// Update site settings
export const updateSettings = mutation({
  args: {
    companyName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    instagramUrl: v.optional(v.string()),
    facebookUrl: v.optional(v.string()),
    tiktokUrl: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    twitterUrl: v.optional(v.string()),
    youtubeUrl: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    maintenanceMode: v.optional(v.boolean()),
    emailNotifications: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

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

// Get integration status (check if APIs are configured)
export const getIntegrationStatus = query({
  handler: async () => {
    // These will be checked at runtime
    // We return static info here since env vars aren't accessible in queries
    return {
      resend: "Check environment",
      stripe: "Check environment",
      convex: "Connected",
      googleAnalytics: "Check environment",
    };
  },
});

// Send a test email
export const sendTestEmail = action({
  args: {
    toEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #03030a; font-family: Arial, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; background: #0a0a12; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 30px;">
    <h2 style="margin: 0 0 20px 0; color: #00d4ff;">Test Email from Media4U</h2>
    <p style="margin: 0 0 8px 0; color: #e2e8f0;">This is a test email to verify your email configuration is working correctly.</p>
    <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 14px;">
      Sent at: ${new Date().toISOString()}
    </p>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
        If you received this email, your Resend API integration is working!
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.toEmail,
          subject: "Media4U Test Email",
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Failed: ${error}` };
      }

      return { success: true, message: `Test email sent to ${args.toEmail}` };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
});

// Check integrations (action so we can access env vars)
export const checkIntegrations = action({
  args: {},
  handler: async () => {
    const integrations = {
      resend: !!process.env.RESEND_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      convex: true, // Always true if this runs
      googleAnalytics: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      fromEmail: process.env.FROM_EMAIL || "Not set",
      siteUrl: process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "Not set",
    };

    return integrations;
  },
});

// Export data as JSON (for backup)
export const exportData = query({
  args: {
    dataType: v.union(
      v.literal("contacts"),
      v.literal("newsletter"),
      v.literal("leads"),
      v.literal("projects"),
      v.literal("community")
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    switch (args.dataType) {
      case "contacts":
        return await ctx.db.query("contactSubmissions").collect();
      case "newsletter":
        return await ctx.db.query("newsletterSubscribers").collect();
      case "leads":
        return await ctx.db.query("leads").collect();
      case "projects":
        return await ctx.db.query("projects").collect();
      case "community":
        return await ctx.db.query("communityMembers").collect();
      default:
        return [];
    }
  },
});
