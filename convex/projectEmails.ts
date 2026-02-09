import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "Media4U <noreply@media4u.fun>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://media4u.fun";

// Shared email sending logic
async function sendWelcomeEmailLogic(args: {
  clientName: string;
  clientEmail: string;
  projectType: string;
  projectDescription: string;
}) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set");
    return { success: false, error: "Email service not configured" };
  }

  const emailHtml = generateWelcomeEmailHTML(args);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: args.clientEmail,
        subject: `🎉 Your ${args.projectType} Project is Ready!`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      return { success: false, error: "Failed to send email" };
    }

    const data = await response.json();
    console.log("Welcome email sent successfully:", data);
    return { success: true, emailId: data.id };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: String(error) };
  }
}

// Generate HTML template
function generateWelcomeEmailHTML(args: {
  clientName: string;
  projectType: string;
  projectDescription: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Media4U Project is Ready!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0e1a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e1a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">
                🎉 Your Project is Ready!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px; color: #e5e7eb;">
                Hi ${args.clientName},
              </p>

              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px; color: #e5e7eb;">
                Great news! Your project with <strong style="color: #00d4ff;">Media4U</strong> has been created and we're excited to get started.
              </p>

              <!-- Project Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 12px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;">
                      📦 Your Project
                    </p>
                    <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: bold; color: #00d4ff;">
                      ${args.projectType}
                    </h2>
                    <p style="margin: 0; font-size: 14px; color: #d1d5db; line-height: 1.5;">
                      ${args.projectDescription}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Access Portal CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${SITE_URL}/portal" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Access Your Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 1.6; margin: 20px 0 30px; color: #9ca3af; text-align: center;">
                First time? Create your account to track your project progress
              </p>

              <!-- What You Can Do -->
              <div style="background-color: rgba(139, 92, 246, 0.1); border-left: 4px solid #8b5cf6; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; font-size: 18px; color: #8b5cf6;">
                  📋 What You Can Do in Your Portal
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #e5e7eb; line-height: 1.8;">
                  <li>Track your project status in real-time</li>
                  <li>Set up your integration vault (API keys, credentials)</li>
                  <li>View project milestones and updates</li>
                  <li>Access your live site when ready</li>
                  <li>Contact support anytime</li>
                </ul>
              </div>

              <!-- Next Steps -->
              <div style="background-color: rgba(34, 197, 94, 0.1); border-left: 4px solid #22c55e; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <h3 style="margin: 0 0 15px; font-size: 18px; color: #22c55e;">
                  ✅ Next Steps
                </h3>
                <ol style="margin: 0; padding-left: 20px; color: #e5e7eb; line-height: 1.8;">
                  <li><strong>Log in to your portal</strong> using the button above</li>
                  <li><strong>Set up your integration vault</strong> with any API keys we'll need</li>
                  <li><strong>Stay tuned</strong> for project updates via email</li>
                </ol>
              </div>

              <!-- Support -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #9ca3af;">
                      Need help getting started?
                    </p>
                    <a href="${SITE_URL}/portal/support" style="color: #00d4ff; text-decoration: none; font-weight: 600;">
                      Contact Support →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 0; color: #e5e7eb;">
                We're excited to bring your vision to life!
              </p>

              <p style="font-size: 16px; line-height: 1.6; margin: 10px 0 0; color: #e5e7eb;">
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
                <a href="${SITE_URL}" style="color: #00d4ff; text-decoration: none;">media4u.fun</a> |
                <a href="${SITE_URL}/portal/support" style="color: #00d4ff; text-decoration: none;">Support</a>
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
}

// Internal action for scheduler
export const sendProjectWelcomeEmailInternal = internalAction({
  args: {
    clientName: v.string(),
    clientEmail: v.string(),
    projectType: v.string(),
    projectDescription: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendWelcomeEmailLogic(args);
  },
});

// Public action (can be called directly if needed)
export const sendProjectWelcomeEmail = action({
  args: {
    clientName: v.string(),
    clientEmail: v.string(),
    projectType: v.string(),
    projectDescription: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendWelcomeEmailLogic(args);
  },
});
