import { query } from "./_generated/server";
import { v } from "convex/values";

// Get a tech's daily route - all jobs assigned to them for a given date, sorted by routeOrder
export const getTechRoute = query({
  args: {
    techId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, { techId, date }) => {
    // Get assignments where this tech is lead
    const leadAssignments = await ctx.db
      .query("assignments")
      .withIndex("by_leadTechId_date", (q) =>
        q.eq("leadTechId", techId).eq("assignedDate", date)
      )
      .collect();

    // Get assignments where this tech is assistant
    const assistantAssignments = await ctx.db
      .query("assignments")
      .withIndex("by_assistantTechId_date", (q) =>
        q.eq("assistantTechId", techId).eq("assignedDate", date)
      )
      .collect();

    // Combine and tag the role
    const allAssignments = [
      ...leadAssignments.map((a) => ({ ...a, role: "lead" as const })),
      ...assistantAssignments.map((a) => ({ ...a, role: "assistant" as const })),
    ];

    // Sort by routeOrder
    allAssignments.sort((a, b) => a.routeOrder - b.routeOrder);

    // Fetch the job details for each assignment
    const routeItems = await Promise.all(
      allAssignments.map(async (assignment) => {
        const job = await ctx.db.get(assignment.jobId);
        if (!job) return null;

        // Get the other tech's name if there's an assistant
        let assistantTechName: string | undefined;
        let leadTechName: string | undefined;

        if (assignment.assistantTechId && assignment.role === "lead") {
          const assistantRole = await ctx.db
            .query("userRoles")
            .withIndex("by_userId", (q) => q.eq("userId", assignment.assistantTechId!))
            .first();
          assistantTechName = assistantRole?.name ?? undefined;
        }

        if (assignment.role === "assistant") {
          const leadRole = await ctx.db
            .query("userRoles")
            .withIndex("by_userId", (q) => q.eq("userId", assignment.leadTechId))
            .first();
          leadTechName = leadRole?.name ?? undefined;
        }

        return {
          job,
          assignment: { routeOrder: assignment.routeOrder },
          role: assignment.role,
          assistantTechName,
          leadTechName,
        };
      })
    );

    return routeItems.filter(Boolean);
  },
});
