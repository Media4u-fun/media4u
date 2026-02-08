import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { requireAdmin } from "./auth";

// Generate a random token for invite links
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ============================================
// ADMIN: Invite Management
// ============================================

// Get all invites (for admin)
export const getAllInvites = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("communityInvites")
      .order("desc")
      .collect();
  },
});

// Create and send an invite
export const createInvite = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Check if email already has a pending invite
    const existing = await ctx.db
      .query("communityInvites")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();

    if (existing && (existing.status === "pending" || existing.status === "approved")) {
      throw new Error("This email already has an active invite or is already a member");
    }

    const token = generateToken();

    const inviteId = await ctx.db.insert("communityInvites", {
      email: args.email.toLowerCase().trim(),
      name: args.name,
      token,
      status: "pending",
      message: args.message,
      sentAt: Date.now(),
    });

    return { inviteId, token };
  },
});

// Revoke an invite
export const revokeInvite = mutation({
  args: {
    id: v.id("communityInvites"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.patch(args.id, {
      status: "revoked",
    });
  },
});

// Resend invite (generates new token)
export const resendInvite = mutation({
  args: {
    id: v.id("communityInvites"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const invite = await ctx.db.get(args.id);
    if (!invite) throw new Error("Invite not found");

    const newToken = generateToken();

    await ctx.db.patch(args.id, {
      token: newToken,
      status: "pending",
      sentAt: Date.now(),
    });

    return { token: newToken, email: invite.email, name: invite.name };
  },
});

// ============================================
// PUBLIC: Submission Flow
// ============================================

// Validate invite token (public - for submission page)
export const validateInviteToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("communityInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      return { valid: false, error: "Invalid invite link" };
    }

    if (invite.status === "revoked") {
      return { valid: false, error: "This invite has been revoked" };
    }

    if (invite.status === "approved") {
      return { valid: false, error: "You have already been approved" };
    }

    if (invite.status === "submitted") {
      return { valid: false, error: "Your submission is pending review" };
    }

    return {
      valid: true,
      invite: {
        name: invite.name,
        email: invite.email,
      },
    };
  },
});

// Submit community entry (public - via invite token)
export const submitCommunityEntry = mutation({
  args: {
    token: v.string(),
    worldName: v.string(),
    description: v.string(),
    images: v.array(v.string()),
    videoUrl: v.optional(v.string()),
    multiverseUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Find the invite by token
    const invite = await ctx.db
      .query("communityInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      throw new Error("Invalid invite token");
    }

    if (invite.status !== "pending") {
      throw new Error("This invite is no longer valid");
    }

    // Create the community member entry (not approved yet)
    const memberId = await ctx.db.insert("communityMembers", {
      inviteId: invite._id,
      name: invite.name,
      worldName: args.worldName,
      description: args.description,
      images: args.images,
      videoUrl: args.videoUrl,
      multiverseUrl: args.multiverseUrl,
      websiteUrl: args.websiteUrl,
      socialLinks: args.socialLinks,
      featured: false,
      approved: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update invite status
    await ctx.db.patch(invite._id, {
      status: "submitted",
    });

    return memberId;
  },
});

// ============================================
// ADMIN: Approval & Management
// ============================================

// Get all submissions (pending approval)
export const getPendingSubmissions = query({
  handler: async (ctx) => {
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_approved", (q) => q.eq("approved", false))
      .collect();

    // Get invite info for each member
    const withInvites = await Promise.all(
      members.map(async (member) => {
        const invite = await ctx.db.get(member.inviteId);
        return {
          ...member,
          inviteEmail: invite?.email,
          inviteName: invite?.name,
        };
      })
    );

    return withInvites;
  },
});

// Approve a submission
export const approveSubmission = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    // Approve the member
    await ctx.db.patch(args.id, {
      approved: true,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update invite status
    await ctx.db.patch(member.inviteId, {
      status: "approved",
    });

    return args.id;
  },
});

// Reject a submission (delete it)
export const rejectSubmission = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    // Delete the member entry
    await ctx.db.delete(args.id);

    // Update invite status back to pending so they can resubmit
    await ctx.db.patch(member.inviteId, {
      status: "pending",
    });
  },
});

// Toggle featured status
export const toggleFeatured = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    await ctx.db.patch(args.id, {
      featured: !member.featured,
      updatedAt: Date.now(),
    });
  },
});

// Delete a community member
export const deleteMember = mutation({
  args: {
    id: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    await ctx.db.delete(args.id);
  },
});

// Update a community member (for editing typos, etc.)
export const updateMember = mutation({
  args: {
    id: v.id("communityMembers"),
    name: v.optional(v.string()),
    worldName: v.optional(v.string()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    videoUrl: v.optional(v.string()),
    multiverseUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      instagram: v.optional(v.string()),
      youtube: v.optional(v.string()),
      tiktok: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.worldName !== undefined) updates.worldName = args.worldName;
    if (args.description !== undefined) updates.description = args.description;
    if (args.images !== undefined) updates.images = args.images;
    if (args.videoUrl !== undefined) updates.videoUrl = args.videoUrl || undefined;
    if (args.multiverseUrl !== undefined) updates.multiverseUrl = args.multiverseUrl || undefined;
    if (args.websiteUrl !== undefined) updates.websiteUrl = args.websiteUrl || undefined;
    if (args.socialLinks !== undefined) updates.socialLinks = args.socialLinks;

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

// ============================================
// PUBLIC: Display
// ============================================

// Get community stats for public display
export const getCommunityStats = query({
  handler: async (ctx) => {
    const allMembers = await ctx.db
      .query("communityMembers")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .collect();

    const featuredCount = allMembers.filter(m => m.featured).length;

    // Count unique creators
    const uniqueCreators = new Set(allMembers.map(m => m.name)).size;

    return {
      totalWorlds: allMembers.length,
      totalCreators: uniqueCreators,
      featuredCount,
    };
  },
});

// Get all approved community members (for public page)
export const getApprovedMembers = query({
  handler: async (ctx) => {
    const members = await ctx.db
      .query("communityMembers")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .collect();

    // Sort: featured first, then by approval date
    return members.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (b.approvedAt || 0) - (a.approvedAt || 0);
    });
  },
});

// Get all community members (for admin)
export const getAllMembers = query({
  handler: async (ctx) => {
    const members = await ctx.db
      .query("communityMembers")
      .order("desc")
      .collect();

    // Get invite info for each
    const withInvites = await Promise.all(
      members.map(async (member) => {
        const invite = await ctx.db.get(member.inviteId);
        return {
          ...member,
          inviteEmail: invite?.email,
        };
      })
    );

    return withInvites;
  },
});

// ============================================
// PUBLIC: Invite Requests
// ============================================

// Submit a request for an invite (public)
// Request an invite to join the VR Multiverse Community
export const requestInvite = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const email = args.email.toLowerCase().trim();

      // Check if already requested
      const existing = await ctx.db
        .query("communityInviteRequests")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existing) {
        if (existing.status === "pending") {
          throw new Error("Good news! You already have a pending request. We'll review it and send your invite soon!");
        }
        if (existing.status === "invited") {
          throw new Error("You're already invited! Check your email for the invite link - it's still valid unless revoked.");
        }
      }

      // Check if they already have an invite
      const existingInvite = await ctx.db
        .query("communityInvites")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existingInvite) {
        throw new Error("You're already invited! Check your email for the invite link - it's still valid unless revoked.");
      }

      const requestId = await ctx.db.insert("communityInviteRequests", {
        name: args.name.trim(),
        email,
        message: args.message?.trim() || undefined,
        status: "pending",
        createdAt: Date.now(),
      });

      return requestId;
    } catch (error) {
      console.error("requestInvite error:", error);
      throw error;
    }
  },
});

// Get all invite requests (admin)
export const getInviteRequests = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("communityInviteRequests")
      .order("desc")
      .collect();
  },
});

// Update invite request status (admin)
export const updateInviteRequestStatus = mutation({
  args: {
    id: v.id("communityInviteRequests"),
    status: v.union(v.literal("invited"), v.literal("declined")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// ============================================
// EMAIL: Send Invite
// ============================================

export const sendInviteEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
    token: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const submitUrl = `https://media4u.fun/community/submit?token=${args.token}`;

    const personalMessage = args.message
      ? `<p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0; font-style: italic; padding: 16px; background: rgba(0, 212, 255, 0.05); border-left: 3px solid #00d4ff; border-radius: 4px;">"${args.message}"</p>`
      : "";

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to the VR Multiverse Community</title>
</head>
<body style="margin: 0; padding: 0; background-color: #03030a; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #03030a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #0a0a12; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 20px 40px;">
              <img src="https://media4u.fun/media4u-logo.png" alt="Media4U" width="120" style="display: block; margin: 0 auto 12px auto;" />
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                VR Multiverse Community
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #ffffff;">
                You're Invited, ${args.name}!
              </h2>

              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                We'd love to feature your VR world in the Media4U Multiverse Community - a curated showcase of trusted creators and their virtual experiences.
              </p>

              ${personalMessage}

              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
                This is an invite-only community of people building meaningful spaces in the Multiverse. We think your work belongs here.
              </p>

              <!-- What You'll Need -->
              <div style="margin: 24px 0; padding: 20px; background: rgba(0, 212, 255, 0.05); border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #00d4ff;">
                  What You'll Need
                </h3>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 8px 0; color: #e2e8f0; font-size: 14px;">
                      <span style="color: #00d4ff; margin-right: 8px;">&#10003;</span>
                      <strong>Screenshots</strong> - 1-5 images of your VR world
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #e2e8f0; font-size: 14px;">
                      <span style="color: #a855f7; margin-right: 8px;">&#10003;</span>
                      <strong>Video Tour</strong> - YouTube link (optional but recommended!)
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #e2e8f0; font-size: 14px;">
                      <span style="color: #22c55e; margin-right: 8px;">&#10003;</span>
                      <strong>Description</strong> - A few sentences about your world
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #e2e8f0; font-size: 14px;">
                      <span style="color: #f97316; margin-right: 8px;">&#10003;</span>
                      <strong>Links</strong> - Your VR world link + socials (optional)
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;" width="100%">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);">
                    <a href="${submitUrl}" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Submit Your World
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #94a3b8;">
                This invite link is unique to you. Submissions are reviewed within 24-48 hours.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #e2e8f0;">
                      <a href="mailto:devland@media4u.fun" style="color: #00d4ff; text-decoration: none;">devland@media4u.fun</a>
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #e2e8f0;">
                      <a href="https://media4u.fun" style="color: #00d4ff; text-decoration: none;">media4u.fun</a>
                    </p>
                    <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                      &copy; ${new Date().getFullYear()} Media4U. All rights reserved.
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

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: `You're Invited to the VR Multiverse Community, ${args.name}!`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send invite email:", error);
        return { success: false, error: response.statusText };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending invite email:", error);
      return { success: false, error: String(error) };
    }
  },
});

// ============================================
// EMAIL: Admin Notifications
// ============================================

// Notify admin when someone requests an invite
export const notifyAdminInviteRequest = action({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const messageSection = args.message
      ? `<p style="margin: 16px 0; padding: 16px; background: rgba(0, 212, 255, 0.1); border-radius: 8px; color: #e2e8f0;"><strong>Their message:</strong><br/>"${args.message}"</p>`
      : "";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #03030a; font-family: Arial, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; background: #0a0a12; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 30px;">
    <h2 style="margin: 0 0 20px 0; color: #00d4ff;">New Community Invite Request</h2>
    <p style="margin: 0 0 8px 0; color: #e2e8f0;"><strong>Name:</strong> ${args.name}</p>
    <p style="margin: 0 0 8px 0; color: #e2e8f0;"><strong>Email:</strong> ${args.email}</p>
    ${messageSection}
    <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 14px;">
      Review this request in your <a href="https://media4u.fun/admin/community" style="color: #00d4ff;">Admin Dashboard</a>
    </p>
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
          to: ADMIN_EMAIL,
          subject: `Community Invite Request: ${args.name}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send admin notification:", error);
        return { success: false, error: response.statusText };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending admin notification:", error);
      return { success: false, error: String(error) };
    }
  },
});

// Notify admin when someone submits their community entry
export const notifyAdminSubmission = action({
  args: {
    name: v.string(),
    email: v.string(),
    worldName: v.string(),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 20px; background-color: #03030a; font-family: Arial, sans-serif;">
  <div style="max-width: 500px; margin: 0 auto; background: #0a0a12; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); padding: 30px;">
    <h2 style="margin: 0 0 20px 0; color: #8b5cf6;">New Community Submission</h2>
    <p style="margin: 0 0 8px 0; color: #e2e8f0;"><strong>Creator:</strong> ${args.name}</p>
    <p style="margin: 0 0 8px 0; color: #e2e8f0;"><strong>Email:</strong> ${args.email}</p>
    <p style="margin: 0 0 8px 0; color: #e2e8f0;"><strong>World Name:</strong> ${args.worldName}</p>
    <p style="margin: 24px 0 0 0; color: #94a3b8; font-size: 14px;">
      Review and approve in your <a href="https://media4u.fun/admin/community" style="color: #00d4ff;">Admin Dashboard</a>
    </p>
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
          to: ADMIN_EMAIL,
          subject: `Community Submission: ${args.worldName} by ${args.name}`,
          html: emailHtml,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send admin notification:", error);
        return { success: false, error: response.statusText };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending admin notification:", error);
      return { success: false, error: String(error) };
    }
  },
});

// ============================================
// NEWSLETTER: Add Community Member
// ============================================

// Add a community member to the newsletter subscribers
export const addMemberToNewsletter = mutation({
  args: {
    memberId: v.id("communityMembers"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get the member
    const member = await ctx.db.get(args.memberId);
    if (!member) {
      throw new Error("Member not found");
    }

    // Get their invite to get email
    const invite = await ctx.db.get(member.inviteId);
    if (!invite) {
      throw new Error("Invite not found");
    }

    const email = invite.email.toLowerCase().trim();

    // Check if already subscribed
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      if (!existing.unsubscribed) {
        throw new Error("Already subscribed to newsletter");
      }
      // Re-subscribe
      await ctx.db.patch(existing._id, { unsubscribed: false });
      return { success: true, resubscribed: true };
    }

    // Add as new subscriber
    await ctx.db.insert("newsletterSubscribers", {
      email,
      subscribedAt: Date.now(),
      unsubscribed: false,
    });

    return { success: true, resubscribed: false };
  },
});

// Add all approved community members to newsletter
export const addAllMembersToNewsletter = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const members = await ctx.db
      .query("communityMembers")
      .collect();

    let added = 0;
    let skipped = 0;

    for (const member of members) {
      const invite = await ctx.db.get(member.inviteId);
      if (!invite) continue;

      const email = invite.email.toLowerCase().trim();

      const existing = await ctx.db
        .query("newsletterSubscribers")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existing) {
        if (existing.unsubscribed) {
          await ctx.db.patch(existing._id, { unsubscribed: false });
          added++;
        } else {
          skipped++;
        }
      } else {
        await ctx.db.insert("newsletterSubscribers", {
          email,
          subscribedAt: Date.now(),
          unsubscribed: false,
        });
        added++;
      }
    }

    return { added, skipped };
  },
});
