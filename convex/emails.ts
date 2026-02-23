import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  emailBaseTemplate,
  emailHeading,
  emailParagraph,
  emailInfoBox,
  emailDivider,
  emailButton,
  emailList,
  emailSuccessIcon,
} from "./lib/emailTemplates";

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
      const adminHtml = emailBaseTemplate(`
        ${emailHeading("New Contact Form Submission")}
        ${emailParagraph("You have received a new message from your website contact form.")}
        ${emailDivider()}
        ${emailInfoBox("Name", args.name)}
        ${emailInfoBox("Email", args.email)}
        ${emailInfoBox("Service Interested", args.service)}
        ${emailInfoBox("Message", args.message.replace(/\n/g, "<br>"))}
        ${emailDivider()}
        ${emailButton("View in Admin Panel", "https://media4u.fun/admin/inbox")}
      `);

      const adminResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: "devland@media4u.fun",
          subject: `New Contact Form Submission from ${args.name}`,
          html: adminHtml,
        }),
      });

      if (!adminResponse.ok) {
        console.error("Failed to send admin email:", adminResponse.statusText);
        return { success: false, error: "Failed to send notification" };
      }

      // Send confirmation to user
      const userHtml = emailBaseTemplate(`
        ${emailSuccessIcon()}
        ${emailHeading(`Thank You, ${args.name}!`)}
        ${emailParagraph("We've received your message and will get back to you shortly. Our team typically responds within 24 hours.")}
        ${emailDivider()}
        ${emailHeading("Your Message", "small")}
        ${emailInfoBox("Service", args.service)}
        ${emailParagraph(args.message.replace(/\n/g, "<br>"))}
        ${emailDivider()}
        ${emailParagraph("If you have any additional questions, feel free to reply to this email.")}
        ${emailParagraph("<strong>Best regards,</strong><br>The Media4U Team")}
      `);

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
          html: userHtml,
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
      const html = emailBaseTemplate(`
        ${emailSuccessIcon()}
        ${emailHeading("Welcome to Media4U!")}
        ${emailParagraph("Thank you for subscribing to our newsletter. You're now part of our creative community!")}
        ${emailDivider()}
        ${emailHeading("What to Expect", "medium")}
        ${emailList([
          "<strong>Latest VR Trends:</strong> Cutting-edge virtual reality experiences and innovations",
          "<strong>Web Design Tips:</strong> Modern design techniques and best practices",
          "<strong>Digital Innovation:</strong> Insights into the future of digital experiences",
          "<strong>Exclusive Content:</strong> Behind-the-scenes looks at our projects",
        ])}
        ${emailDivider()}
        ${emailParagraph("We're excited to have you here and can't wait to share amazing content with you.")}
        ${emailButton("Visit Our Website", "https://media4u.fun")}
        ${emailParagraph("<strong>Best regards,</strong><br>The Media4U Team")}
      `);

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
          html: html,
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

export const sendProjectRequestEmail = action({
  args: {
    name: v.string(),
    email: v.string(),
    businessName: v.optional(v.string()),
    projectTypes: v.array(v.string()),
    description: v.string(),
    timeline: v.string(),
    budget: v.string(),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return { success: false, error: "Email service not configured" };
    }

    try {
      // Format project types for email
      const projectTypesList = args.projectTypes.join(", ");

      // Send to admin
      const adminHtml = emailBaseTemplate(`
        ${emailHeading("New Project Request")}
        ${emailParagraph("You have received a new project request from your website.")}
        ${emailDivider()}
        ${emailHeading("Client Information", "medium")}
        ${emailInfoBox("Name", args.name)}
        ${emailInfoBox("Email", args.email)}
        ${args.businessName ? emailInfoBox("Business", args.businessName) : ""}
        ${emailDivider()}
        ${emailHeading("Project Details", "medium")}
        ${emailInfoBox("Project Types", projectTypesList)}
        ${emailInfoBox("Timeline", args.timeline)}
        ${emailInfoBox("Budget Range", args.budget)}
        ${emailDivider()}
        ${emailHeading("Project Vision", "small")}
        ${emailParagraph(args.description.replace(/\n/g, "<br>"))}
        ${emailDivider()}
        ${emailButton("View All Requests", "https://media4u.fun/admin")}
      `);

      const adminResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: "devland@media4u.fun",
          subject: `New Project Request from ${args.name}`,
          html: adminHtml,
        }),
      });

      if (!adminResponse.ok) {
        console.error("Failed to send admin email:", adminResponse.statusText);
        return { success: false, error: "Failed to send notification" };
      }

      // Send confirmation to user
      const userHtml = emailBaseTemplate(`
        ${emailSuccessIcon()}
        ${emailHeading(`Thank You, ${args.name}!`)}
        ${emailParagraph("We've received your project request and we're excited to learn more about your vision. Our team is reviewing your details and will be in touch soon.")}
        ${emailDivider()}
        ${emailHeading("What Happens Next?", "medium")}
        ${emailList([
          "We'll review your project details within 24 hours",
          "A member of our team will reach out to discuss your needs",
          "We'll provide a custom quote and timeline for your project",
          "We'll schedule a consultation call to dive deeper into your vision",
        ])}
        ${emailDivider()}
        ${emailHeading("Your Project Details", "medium")}
        ${emailInfoBox("Project Types", projectTypesList)}
        ${emailInfoBox("Timeline", args.timeline)}
        ${emailInfoBox("Budget Range", args.budget)}
        ${emailDivider()}
        ${emailParagraph("If you have any questions in the meantime, feel free to reply to this email. We're here to help bring your vision to life!")}
        ${emailButton("Explore Our Work", "https://media4u.fun/vr")}
        ${emailParagraph("<strong>Best regards,</strong><br>The Media4U Team")}
      `);

      const userResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: args.email,
          subject: "We received your project request - Media4U",
          html: userHtml,
        }),
      });

      if (!userResponse.ok) {
        console.error("Failed to send user email:", userResponse.statusText);
        return { success: true, warning: "Request saved but confirmation email failed" };
      }

      return { success: true };
    } catch (error) {
      console.error("Email sending error:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
});

// Notify admin when someone subscribes to the newsletter
export const notifyAdminNewSubscriber = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured - skipping notification");
      return { success: false };
    }

    try {
      const html = emailBaseTemplate(`
        ${emailHeading("New Newsletter Subscriber")}
        ${emailParagraph("Someone just subscribed to your newsletter.")}
        ${emailDivider()}
        ${emailInfoBox("Email", args.email)}
        ${emailInfoBox("Subscribed At", new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }))}
        ${emailDivider()}
        ${emailButton("View Subscribers", "https://media4u.fun/admin/newsletter")}
      `);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: "devland@media4u.fun",
          subject: `New Newsletter Subscriber: ${args.email}`,
          html,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send subscriber notification:", response.statusText);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending subscriber notification:", error);
      return { success: false };
    }
  },
});

// Notify admin when a new user account is created
export const notifyAdminNewSignup = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured - skipping notification");
      return { success: false };
    }

    try {
      const html = emailBaseTemplate(`
        ${emailHeading("New User Account Created")}
        ${emailParagraph("Someone just signed up for an account on your site.")}
        ${emailDivider()}
        ${args.name ? emailInfoBox("Name", args.name) : ""}
        ${emailInfoBox("Email", args.email)}
        ${emailInfoBox("Signed Up At", new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }))}
        ${emailDivider()}
        ${emailButton("View in Admin Panel", "https://media4u.fun/admin")}
      `);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: "devland@media4u.fun",
          subject: `New Account Signup: ${args.name || args.email}`,
          html,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send signup notification:", response.statusText);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending signup notification:", error);
      return { success: false };
    }
  },
});

// Notify admin when a client takes action in their portal
export const notifyAdminClientActivity = action({
  args: {
    clientName: v.string(),
    clientEmail: v.string(),
    projectName: v.optional(v.string()),
    activityType: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured - skipping notification");
      return { success: false };
    }

    const activityLabels: Record<string, string> = {
      note_added: "Added a Project Note",
      intake_submitted: "Submitted Intake Form",
      vault_updated: "Updated Integration Vault",
      file_uploaded: "Uploaded a File",
      appointment_booked: "Booked an Appointment",
      appointment_cancelled: "Cancelled an Appointment",
      invoice_paid: "Marked Invoice as Paid",
    };

    const label = activityLabels[args.activityType] || args.activityType;

    try {
      const html = emailBaseTemplate(`
        ${emailHeading("Client Portal Activity")}
        ${emailParagraph(`<strong>${args.clientName}</strong> just took an action in their portal.`)}
        ${emailDivider()}
        ${emailInfoBox("Activity", label)}
        ${emailInfoBox("Client", args.clientName)}
        ${emailInfoBox("Email", args.clientEmail)}
        ${args.projectName ? emailInfoBox("Project", args.projectName) : ""}
        ${emailInfoBox("Details", args.description)}
        ${emailInfoBox("Time", new Date().toLocaleString("en-US", { timeZone: "America/Phoenix" }))}
        ${emailDivider()}
        ${emailButton("View in Admin Panel", "https://media4u.fun/admin/projects")}
      `);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: "devland@media4u.fun",
          subject: `Client Activity: ${args.clientName} - ${label}`,
          html,
        }),
      });

      if (!response.ok) {
        console.error("Failed to send client activity notification:", response.statusText);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending client activity notification:", error);
      return { success: false };
    }
  },
});
