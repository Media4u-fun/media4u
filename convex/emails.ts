import { action } from "./_generated/server";
import { v } from "convex/values";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "hello@media4u.fun";

export const sendContactFormEmail = action({
  args: {
    name: v.string(),
    email: v.string(),
    service: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    try {
      // Send to admin
      const adminResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: "hello@media4u.fun",
          subject: `New Contact Form Submission from ${args.name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${args.name}</p>
            <p><strong>Email:</strong> ${args.email}</p>
            <p><strong>Service Interested:</strong> ${args.service}</p>
            <p><strong>Message:</strong></p>
            <p>${args.message.replace(/\n/g, "<br>")}</p>
            <hr>
            <p><small>This email was automatically sent from Media4U contact form</small></p>
          `,
        }),
      });

      if (!adminResponse.ok) {
        console.error("Failed to send admin email:", adminResponse.statusText);
        return { success: false, error: "Failed to send notification" };
      }

      // Send confirmation to user
      const userResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: "We received your message - Media4U",
          html: `
            <h2>Thank You, ${args.name}!</h2>
            <p>We've received your message and will get back to you shortly.</p>
            <p><strong>Your message:</strong></p>
            <p>${args.message.replace(/\n/g, "<br>")}</p>
            <p>Best regards,<br>The Media4U Team</p>
            <hr>
            <p><small>This email was automatically sent from Media4U</small></p>
          `,
        }),
      });

      if (!userResponse.ok) {
        console.error("Failed to send user email:", userResponse.statusText);
        return { success: true, warning: "Message saved but confirmation email failed" };
      }

      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

export const sendNewsletterWelcomeEmail = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

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
          subject: "Welcome to Media4U Newsletter",
          html: `
            <h2>Welcome to Media4U!</h2>
            <p>Thank you for subscribing to our newsletter.</p>
            <p>Stay updated with the latest trends in VR technology, web design, and digital innovation.</p>
            <p>Best regards,<br>The Media4U Team</p>
            <hr>
            <p><small>You received this email because you subscribed to Media4U newsletter</small></p>
          `,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send welcome email:", response.statusText);
        return { success: false, error: "Failed to send email" };
      }

      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});
