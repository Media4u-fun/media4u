import { action } from "./_generated/server";
import { v } from "convex/values";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Media4U <noreply@media4u.fun>";

// Send email to project client with optional attachments
export const sendProjectClientEmail = action({
  args: {
    to: v.string(),
    toName: v.string(),
    projectName: v.string(),
    subject: v.string(),
    message: v.string(),
    attachments: v.optional(v.array(v.object({
      filename: v.string(),
      content: v.string(), // base64 encoded
    }))),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return { success: false, error: "Email service not configured" };
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${args.subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0e1a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e1a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #ffffff;">
                Project Update
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px; color: #e5e7eb;">
                Hi ${args.toName},
              </p>

              <div style="background-color: rgba(0, 212, 255, 0.1); border-left: 4px solid #00d4ff; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                  Project: ${args.projectName}
                </p>
              </div>

              <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #e5e7eb; margin: 24px 0;">
${args.message}
              </div>

              ${args.attachments && args.attachments.length > 0 ? `
              <div style="margin: 30px 0; padding: 20px; background-color: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
                <p style="margin: 0 0 12px; font-size: 14px; color: #8b5cf6; font-weight: 600;">
                  📎 ${args.attachments.length} Attachment${args.attachments.length > 1 ? 's' : ''} Included
                </p>
                <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                  ${args.attachments.map(a => a.filename).join(', ')}
                </p>
              </div>
              ` : ''}

              <p style="font-size: 15px; line-height: 1.6; margin: 30px 0 0; color: #e5e7eb;">
                If you have any questions, feel free to reply to this email or check your portal.
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;" width="100%">
                <tr>
                  <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%);">
                    <a href="https://media4u.fun/portal" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none;">
                      Access Your Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 15px; line-height: 1.6; margin: 24px 0 0; color: #e5e7eb;">
                - The Media4U Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
              <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                Professional Websites & Immersive VR Experiences
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                <a href="https://media4u.fun" style="color: #00d4ff; text-decoration: none;">media4u.fun</a>
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
      const emailData: {
        from: string;
        to: string;
        subject: string;
        html: string;
        attachments?: Array<{ filename: string; content: string }>;
      } = {
        from: FROM_EMAIL,
        to: args.to,
        subject: args.subject,
        html: emailHtml,
      };

      // Add attachments if provided
      if (args.attachments && args.attachments.length > 0) {
        emailData.attachments = args.attachments;
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Failed to send email:", error);
        return { success: false, error: "Failed to send email" };
      }

      const data = await response.json();
      console.log("Project client email sent successfully:", data);
      return { success: true, emailId: data.id };
    } catch (error) {
      console.error("Error sending project client email:", error);
      return { success: false, error: String(error) };
    }
  },
});
