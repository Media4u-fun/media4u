import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { requireAdmin } from "./auth";

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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Delete quote request
export const deleteQuoteRequest = mutation({
  args: {
    id: v.id("quoteRequests"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

// Convert quote request to project
export const createProjectFromQuoteRequest = mutation({
  args: {
    quoteId: v.id("quoteRequests"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Get the quote request
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) {
      throw new Error("Quote request not found");
    }

    // Create project with quote request info
    const projectId = await ctx.db.insert("projects", {
      name: quote.name,
      email: quote.email || "",
      company: undefined,
      phone: quote.phone || undefined,
      projectType: quote.issueType, // Service type (New Website, VR Experience, etc.)
      description: quote.description || `${quote.issueType} for ${quote.propertyType}`,
      requirements: undefined,
      budget: quote.zipCode !== "Not specified" ? quote.zipCode : undefined, // Budget was stored in zipCode
      timeline: undefined,
      status: "new",
      notes: `Converted from quote request.\n\nOriginal details:\n- Service: ${quote.issueType}\n- Business Type: ${quote.propertyType}\n- Budget: ${quote.zipCode}`,
      liveUrl: undefined,
      leadId: undefined,
      backendComplexity: undefined,
      technicalFeatures: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update quote status to closed
    await ctx.db.patch(args.quoteId, {
      status: "closed",
    });

    return projectId;
  },
});

// Send notification email to Media4U when new quote is submitted
export const sendQuoteNotification = action({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    serviceType: v.string(),
    businessType: v.string(),
    budget: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";
    const NOTIFY_EMAIL = "devland@media4u.fun"; // Your email to receive notifications

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quote Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #03030a; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #03030a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #0a0a12; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #00d4ff;">
                New Quote Request!
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">
                Someone wants to work with Media4U
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(0, 212, 255, 0.05); border-left: 3px solid #00d4ff; border-radius: 4px; margin-bottom: 12px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #00d4ff; text-transform: uppercase;">Name</p>
                    <p style="margin: 0; font-size: 16px; color: #e2e8f0;">${args.name}</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(0, 212, 255, 0.05); border-left: 3px solid #00d4ff; border-radius: 4px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #00d4ff; text-transform: uppercase;">Email</p>
                    <p style="margin: 0; font-size: 16px; color: #e2e8f0;">${args.email || "Not provided"}</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(0, 212, 255, 0.05); border-left: 3px solid #00d4ff; border-radius: 4px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #00d4ff; text-transform: uppercase;">Phone</p>
                    <p style="margin: 0; font-size: 16px; color: #e2e8f0;">${args.phone || "Not provided"}</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(139, 92, 246, 0.05); border-left: 3px solid #8b5cf6; border-radius: 4px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #8b5cf6; text-transform: uppercase;">Service Needed</p>
                    <p style="margin: 0; font-size: 16px; color: #e2e8f0;">${args.serviceType}</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(139, 92, 246, 0.05); border-left: 3px solid #8b5cf6; border-radius: 4px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #8b5cf6; text-transform: uppercase;">Business Type</p>
                    <p style="margin: 0; font-size: 16px; color: #e2e8f0;">${args.businessType}</p>
                  </td>
                </tr>
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(34, 197, 94, 0.05); border-left: 3px solid #22c55e; border-radius: 4px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #22c55e; text-transform: uppercase;">Budget</p>
                    <p style="margin: 0; font-size: 16px; color: #e2e8f0;">${args.budget || "Not specified"}</p>
                  </td>
                </tr>
                ${args.description ? `
                <tr><td style="height: 12px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: rgba(255, 255, 255, 0.05); border-left: 3px solid #94a3b8; border-radius: 4px;">
                    <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Project Description</p>
                    <p style="margin: 0; font-size: 16px; color: #e2e8f0; white-space: pre-wrap;">${args.description}</p>
                  </td>
                </tr>
                ` : ""}
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0 0 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);">
                    <a href="https://media4u.fun/admin/inbox" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      View in Admin Panel
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                This notification was sent from your Media4U website.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
          to: NOTIFY_EMAIL,
          subject: `New Quote Request from ${args.name} - ${args.serviceType}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send notification:", error);
        return { success: false, error: response.statusText };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending notification:", error);
      return { success: false, error: String(error) };
    }
  },
});
