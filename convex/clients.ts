import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all unique clients aggregated from all tables
export const getAllClients = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("projects").collect();
    const leads = await ctx.db.query("leads").collect();
    const requests = await ctx.db.query("projectRequests").collect();
    const contacts = await ctx.db.query("contactSubmissions").collect();

    // Create a map to consolidate clients by email
    const clientsMap = new Map<string, {
      primaryEmail: string;
      name: string;
      emails: Array<{ address: string; label: string; isPrimary: boolean }>;
      phone?: string;
      company?: string;
      // Related records
      projectIds: string[];
      leadIds: string[];
      requestIds: string[];
      contactIds: string[];
      // Metadata
      firstSeen: number;
      lastActivity: number;
      totalInteractions: number;
    }>();

    // Helper to add or update client in map
    function addClient(
      email: string,
      name: string,
      emails: Array<{ address: string; label: string; isPrimary: boolean }> | undefined,
      phone: string | undefined,
      company: string | undefined,
      createdAt: number,
      recordId: string,
      type: "project" | "lead" | "request" | "contact"
    ) {
      // Use primary email or first email from array, fallback to single email
      const primaryEmail = emails?.find(e => e.isPrimary)?.address || emails?.[0]?.address || email;

      if (!clientsMap.has(primaryEmail)) {
        clientsMap.set(primaryEmail, {
          primaryEmail,
          name,
          emails: emails || [{ address: email, label: "Primary", isPrimary: true }],
          phone,
          company,
          projectIds: [],
          leadIds: [],
          requestIds: [],
          contactIds: [],
          firstSeen: createdAt,
          lastActivity: createdAt,
          totalInteractions: 0,
        });
      }

      const client = clientsMap.get(primaryEmail)!;

      // Update fields if they're empty
      if (!client.phone && phone) client.phone = phone;
      if (!client.company && company) client.company = company;

      // Merge emails if new ones exist
      if (emails && emails.length > 0) {
        const existingAddresses = new Set(client.emails.map(e => e.address));
        for (const newEmail of emails) {
          if (!existingAddresses.has(newEmail.address)) {
            client.emails.push(newEmail);
          }
        }
      }

      // Add record ID to appropriate list
      if (type === "project") client.projectIds.push(recordId);
      if (type === "lead") client.leadIds.push(recordId);
      if (type === "request") client.requestIds.push(recordId);
      if (type === "contact") client.contactIds.push(recordId);

      // Update activity tracking
      if (createdAt < client.firstSeen) client.firstSeen = createdAt;
      if (createdAt > client.lastActivity) client.lastActivity = createdAt;
      client.totalInteractions++;
    }

    // Add all projects
    for (const project of projects) {
      addClient(
        project.email,
        project.name,
        project.emails,
        project.phone,
        project.company,
        project.createdAt,
        project._id,
        "project"
      );
    }

    // Add all leads
    for (const lead of leads) {
      addClient(
        lead.email,
        lead.name,
        lead.emails,
        lead.phone,
        lead.company,
        lead.createdAt,
        lead._id,
        "lead"
      );
    }

    // Add all requests
    for (const request of requests) {
      addClient(
        request.email,
        request.name,
        request.emails,
        undefined, // requests don't have phone field
        request.businessName,
        request.createdAt,
        request._id,
        "request"
      );
    }

    // Add all contacts
    for (const contact of contacts) {
      addClient(
        contact.email,
        contact.name,
        contact.emails,
        undefined,
        undefined,
        contact.createdAt,
        contact._id,
        "contact"
      );
    }

    // Convert map to array and sort by last activity
    return Array.from(clientsMap.values()).sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

// Get client details with all related records
export const getClientDetails = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    const leads = await ctx.db
      .query("leads")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    const requests = await ctx.db
      .query("projectRequests")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    const contacts = await ctx.db
      .query("contactSubmissions")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();

    return {
      projects,
      leads,
      requests,
      contacts,
    };
  },
});
