import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Generate a unique proposal token for a lead
export const generateProposalToken = internalMutation({
  args: {
    leadId: v.id("leads"),
    specSiteUrl: v.string(),
    proposalPrice: v.number(), // e.g., 1500 for one-time purchase
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    // Generate unique token (e.g., "just-doors-abc123")
    const businessSlug = (lead.businessName || lead.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30);
    const randomToken = Math.random().toString(36).substring(2, 10);
    const proposalToken = `${businessSlug}-${randomToken}`;

    // Update lead with proposal info
    await ctx.db.patch(args.leadId, {
      proposalToken,
      specSiteUrl: args.specSiteUrl,
      proposalPrice: args.proposalPrice,
      proposalSentAt: Date.now(),
      status: "presented",
    });

    return proposalToken;
  },
});

// Get lead by proposal token (for signup flow)
export const getLeadByProposalToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("leads")
      .withIndex("by_proposalToken", (q) => q.eq("proposalToken", args.token))
      .first();

    return lead;
  },
});

// Send proposal email with link to portal signup
export const sendProposalEmail = action({
  args: {
    leadId: v.id("leads"),
    specSiteUrl: v.string(),
    proposalPrice: v.number(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; proposalToken: string; signupLink: string; emailId: string }> => {
    // Generate proposal token (call it directly since it's in the same file)
    const lead = await ctx.runQuery(api.leads.getLeadById, { id: args.leadId });
    if (!lead) throw new Error("Lead not found");

    // Generate unique token (e.g., "just-doors-abc123")
    const businessSlug = (lead.businessName || lead.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30);
    const randomToken = Math.random().toString(36).substring(2, 10);
    const proposalToken = `${businessSlug}-${randomToken}`;

    // Update lead with proposal info
    await ctx.runMutation(api.leads.updateLead, {
      id: args.leadId,
      proposalToken,
      specSiteUrl: args.specSiteUrl,
      proposalPrice: args.proposalPrice,
      status: "presented",
    });

    // Update last contacted
    await ctx.runMutation(api.leads.updateLastContacted, { id: args.leadId });

    const businessName = lead.businessName || lead.name;
    const signupLink = `https://media4u.fun/portal/signup?proposal=${proposalToken}`;

    // Email HTML with proposal
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Custom Website is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; line-height: 1.3;">
                Your Custom Website is Ready!
              </h1>
              <p style="margin: 12px 0 0 0; color: #e9d5ff; font-size: 16px;">
                We built something special for ${businessName}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Hi ${lead.name},
              </p>
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                We noticed your business and thought you deserved a better online presence. So we built you a complete, professional website - <strong>no strings attached</strong>.
              </p>
              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                Check it out here:
              </p>

              <!-- Preview Site Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${args.specSiteUrl}" style="display: inline-block; background-color: #667eea; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);">
                      👉 View Your Website
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                <strong>Your custom website includes:</strong>
              </p>
              <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #1f2937; font-size: 15px; line-height: 1.9;">
                <li><strong>Custom Professional Design</strong> - Tailored to your business and industry</li>
                <li><strong>Mobile-Optimized</strong> - Looks perfect on phones, tablets, and desktops</li>
                <li><strong>Lightning Fast</strong> - Modern tech stack for quick load times</li>
                <li><strong>Contact Form</strong> - Capture leads directly from your site</li>
                <li><strong>SEO Ready</strong> - Optimized for Google search visibility</li>
                <li><strong>SSL Certificate</strong> - Secure HTTPS encryption</li>
                <li><strong>Custom Domain Setup</strong> - We'll connect your domain</li>
                <li><strong>Analytics Integration</strong> - Track visitors and performance</li>
                <li><strong>Launch in 24 Hours</strong> - Site goes live as soon as you're ready</li>
              </ul>

              <!-- Hosting Upsell Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 12px; margin-bottom: 30px; border: 2px solid #fbbf24;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 4px;">Optional Add-On</span>
                    </div>
                    <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 18px; font-weight: 700;">Managed Hosting + Updates</h3>
                    <p style="margin: 0 0 12px 0; color: #78350f; font-size: 14px; line-height: 1.6;">
                      Keep your site fast, secure, and up-to-date with our managed service:
                    </p>
                    <ul style="margin: 0 0 12px 0; padding-left: 20px; color: #78350f; font-size: 13px; line-height: 1.7;">
                      <li>Premium hosting on global CDN</li>
                      <li>Unlimited content updates</li>
                      <li>Security patches and backups</li>
                      <li>Priority email support</li>
                    </ul>
                    <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
                      Just <strong>$79/month</strong> - Cancel anytime
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Pricing Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                <tr>
                  <td style="padding: 30px 24px;">
                    <div style="text-align: center; margin-bottom: 16px;">
                      <div style="font-size: 13px; color: #e9d5ff; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; margin-bottom: 12px;">🎉 Special Launch Offer</div>
                      <div style="font-size: 56px; font-weight: 800; color: #ffffff; line-height: 1; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                        $${args.proposalPrice.toLocaleString()}
                      </div>
                      <div style="font-size: 15px; color: #e9d5ff; margin-top: 8px; font-weight: 500;">One-time payment • No monthly fees</div>
                    </div>
                    <div style="background-color: rgba(255,255,255,0.15); border-radius: 8px; padding: 16px; margin-top: 20px;">
                      <p style="margin: 0; color: #ffffff; font-size: 14px; text-align: center; line-height: 1.6;">
                        ✓ Complete custom website • ✓ Ready to launch<br/>
                        <span style="font-size: 13px; color: #e9d5ff;">Typical agency price: $3,000-$5,000+</span>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                <strong>Ready to claim your website?</strong><br>
                Create your account and the site will be waiting in your dashboard:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${signupLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 8px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                      🚀 Claim My Website
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                No commitment required. Just create an account to see your site.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                <strong>Media4U</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Professional Websites & Immersive VR Experiences
              </p>
              <p style="margin: 12px 0 0 0;">
                <a href="https://media4u.fun" style="color: #667eea; text-decoration: none; font-size: 13px; font-weight: 500;">media4u.fun</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const response: Response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Media4U <hello@media4u.fun>",
        to: [lead.email],
        subject: `${businessName} - Your Custom Website is Ready!`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send proposal email: ${error}`);
    }

    const result = await response.json() as { id: string };
    return {
      success: true,
      proposalToken,
      signupLink,
      emailId: result.id,
    };
  },
});
