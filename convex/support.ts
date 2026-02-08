import { action } from "./_generated/server";
import { v } from "convex/values";

// Send a support request from a user TO the admin
export const sendSupportRequest = action({
  args: {
    userName: v.string(),
    userEmail: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || "devland@media4u.fun";
    const SUPPORT_EMAIL = "devland@media4u.fun"; // Where support requests go

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Create email HTML for support request
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Request: ${args.subject}</title>
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
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #00d4ff;">
                New Support Request
              </p>
            </td>
          </tr>

          <!-- User Info -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 16px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #94a3b8;">From:</p>
                    <p style="margin: 0 0 4px 0; font-size: 16px; color: #e2e8f0; font-weight: bold;">${args.userName}</p>
                    <p style="margin: 0; font-size: 14px; color: #00d4ff;">
                      <a href="mailto:${args.userEmail}" style="color: #00d4ff; text-decoration: none;">${args.userEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subject -->
          <tr>
            <td style="padding: 20px 40px 0 40px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #94a3b8;">Subject:</p>
              <p style="margin: 0; font-size: 18px; color: #e2e8f0; font-weight: bold;">${args.subject}</p>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 20px 40px 40px 40px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #94a3b8;">Message:</p>
              <div style="padding: 16px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; border-left: 3px solid #00d4ff;">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${args.message}</p>
              </div>
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-radius: 8px; background: linear-gradient(135deg, #00d4ff 0%, #a855f7 100%);">
                    <a href="mailto:${args.userEmail}?subject=Re: ${args.subject}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none;">
                      Reply to ${args.userName}
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
                This message was sent from the Media4U Portal support form.
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

    // Send email via Resend TO support (admin)
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: SUPPORT_EMAIL,
        reply_to: args.userEmail, // So you can reply directly
        subject: `[Portal Support] ${args.subject}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send support request:", error);
      throw new Error(`Failed to send support request: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.id,
    };
  },
});
