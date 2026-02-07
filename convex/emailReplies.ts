import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendEmailReply = action({
  args: {
    to: v.string(),
    subject: v.string(),
    message: v.string(),
    recipientName: v.string(),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Create professional email HTML (dark theme matching brand)
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${args.subject}</title>
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
                Professional Websites & Immersive VR Experiences
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #e2e8f0;">
                Hi ${args.recipientName},
              </p>
              <div style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">
${args.message}
              </div>
              <p style="margin: 24px 0 0 0; font-size: 15px; color: #e2e8f0;">
                Best regards,<br>
                <strong>The Media4U Team</strong>
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

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: args.to,
        subject: args.subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
    };
  },
});
