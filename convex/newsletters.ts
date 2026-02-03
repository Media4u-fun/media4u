import { mutation, query, action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";
import { internal } from "./_generated/api";

// Queries

// Get all newsletters
export const getAllNewsletters = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent"))),
  },
  handler: async (ctx, args) => {
    // UI-level access control for queries
    if (args.status) {
      return await ctx.db
        .query("newsletters")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("newsletters")
      .order("desc")
      .collect();
  },
});

// Get single newsletter by ID
export const getNewsletter = query({
  args: {
    id: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get newsletters ready to send (scheduled for now or earlier)
export const getScheduledNewsletters = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const scheduled = await ctx.db
      .query("newsletters")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();

    return scheduled.filter(
      (n) => n.scheduledFor && n.scheduledFor <= now
    );
  },
});

// Mutations

// Create a new draft newsletter
export const createNewsletter = mutation({
  args: {
    subject: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const now = Date.now();
    const id = await ctx.db.insert("newsletters", {
      subject: args.subject,
      content: args.content,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Update newsletter
export const updateNewsletter = mutation({
  args: {
    id: v.id("newsletters"),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const newsletter = await ctx.db.get(args.id);
    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    // Can only update drafts
    if (newsletter.status !== "draft") {
      throw new Error("Can only update draft newsletters");
    }

    const updates: Record<string, string | number> = {
      updatedAt: Date.now(),
    };

    if (args.subject !== undefined) {
      updates.subject = args.subject;
    }
    if (args.content !== undefined) {
      updates.content = args.content;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Delete newsletter (drafts only)
export const deleteNewsletter = mutation({
  args: {
    id: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const newsletter = await ctx.db.get(args.id);
    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    // Can only delete drafts
    if (newsletter.status !== "draft") {
      throw new Error("Can only delete draft newsletters");
    }

    await ctx.db.delete(args.id);
  },
});

// Schedule newsletter for future send
export const scheduleNewsletter = mutation({
  args: {
    id: v.id("newsletters"),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const newsletter = await ctx.db.get(args.id);
    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    if (newsletter.status !== "draft") {
      throw new Error("Can only schedule draft newsletters");
    }

    // Schedule must be in the future
    if (args.scheduledFor <= Date.now()) {
      throw new Error("Scheduled time must be in the future");
    }

    // Update status to scheduled
    await ctx.db.patch(args.id, {
      status: "scheduled",
      scheduledFor: args.scheduledFor,
      updatedAt: Date.now(),
    });

    // Schedule the send action using Convex scheduler
    await ctx.scheduler.runAt(args.scheduledFor, internal.newsletters.sendScheduledNewsletter, {
      newsletterId: args.id,
    });

    return args.id;
  },
});

// Internal mutation to mark newsletter as sent (called by action)
export const markNewsletterAsSent = internalMutation({
  args: {
    newsletterId: v.id("newsletters"),
    recipientCount: v.number(),
    successCount: v.number(),
    errorCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.newsletterId, {
      status: "sent",
      sentAt: Date.now(),
      recipientCount: args.recipientCount,
      successCount: args.successCount,
      errorCount: args.errorCount,
      updatedAt: Date.now(),
    });
  },
});

// Actions

// Send newsletter immediately
export const sendNewsletterNow = action({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    // Get newsletter
    const newsletter = await ctx.runQuery(internal.newsletters.getNewsletter, {
      id: args.newsletterId,
    });

    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    if (newsletter.status === "sent") {
      throw new Error("Newsletter already sent");
    }

    // Send the newsletter
    const result = await ctx.runAction(internal.newsletters.sendNewsletterEmail, {
      newsletterId: args.newsletterId,
    });

    return result;
  },
});

// Internal action scheduled by scheduler
export const sendScheduledNewsletter = internalMutation({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    // Trigger the send action
    await ctx.scheduler.runAfter(0, internal.newsletters.sendNewsletterEmail, {
      newsletterId: args.newsletterId,
    });
  },
});

// Send newsletter email to all active subscribers
export const sendNewsletterEmail = action({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "hello@media4u.fun";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    // Get newsletter
    const newsletter = await ctx.runQuery(internal.newsletters.getNewsletter, {
      id: args.newsletterId,
    });

    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    // Get all active subscribers
    const allSubscribers = await ctx.runQuery(internal.newsletters.getAllSubscribers);
    const activeSubscribers = allSubscribers.filter((sub) => !sub.unsubscribed);

    if (activeSubscribers.length === 0) {
      throw new Error("No active subscribers to send to");
    }

    let successCount = 0;
    let errorCount = 0;

    // Send in batches of 50 with delays
    const BATCH_SIZE = 50;
    for (let i = 0; i < activeSubscribers.length; i += BATCH_SIZE) {
      const batch = activeSubscribers.slice(i, i + BATCH_SIZE);

      // Send to each subscriber in the batch
      for (const subscriber of batch) {
        try {
          // Generate unsubscribe link
          const unsubscribeUrl = `https://media4u.fun/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

          // Wrap newsletter content with email template and unsubscribe footer
          const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #03030a; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #03030a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #0a0a12; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #ff2d92 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Media4U
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
                VR Environments & Digital Solutions
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              ${newsletter.content}
            </td>
          </tr>

          <!-- Unsubscribe Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                You're receiving this because you subscribed to Media4U updates.<br>
                <a href="${unsubscribeUrl}" style="color: #00d4ff; text-decoration: none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="https://www.instagram.com/media4uvr/" style="color: #00d4ff; text-decoration: none; font-size: 14px;">Instagram</a>
                        </td>
                        <td style="padding: 0 8px; color: rgba(255, 255, 255, 0.1);">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://www.youtube.com/channel/UCg-C-WFQDr0OdGVI8YX4V5w" style="color: #00d4ff; text-decoration: none; font-size: 14px;">YouTube</a>
                        </td>
                        <td style="padding: 0 8px; color: rgba(255, 255, 255, 0.1);">|</td>
                        <td style="padding: 0 8px;">
                          <a href="https://www.tiktok.com/@media4uvr" style="color: #00d4ff; text-decoration: none; font-size: 14px;">TikTok</a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #e2e8f0;">
                      <a href="mailto:devland@media4u.fun" style="color: #00d4ff; text-decoration: none;">devland@media4u.fun</a>
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #e2e8f0;">
                      <a href="https://media4u.fun" style="color: #00d4ff; text-decoration: none;">media4u.fun</a>
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                      © ${new Date().getFullYear()} Media4U. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
          `.trim();

          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: subscriber.email,
              subject: newsletter.subject,
              html: emailHtml,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
            console.error(`Failed to send to ${subscriber.email}:`, response.statusText);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error sending to ${subscriber.email}:`, error);
        }
      }

      // Delay between batches (1 second)
      if (i + BATCH_SIZE < activeSubscribers.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Mark newsletter as sent
    await ctx.runMutation(internal.newsletters.markNewsletterAsSent, {
      newsletterId: args.newsletterId,
      recipientCount: activeSubscribers.length,
      successCount,
      errorCount,
    });

    return {
      success: true,
      recipientCount: activeSubscribers.length,
      successCount,
      errorCount,
    };
  },
});

// Internal query to get all subscribers (for email sending action)
export const getAllSubscribers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("newsletterSubscribers").collect();
  },
});
