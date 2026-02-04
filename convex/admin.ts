import { query } from "./_generated/server";
import { requireAdmin } from "./auth";

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Get all user roles first
    const userRoles = await ctx.db.query("userRoles").collect();

    // Get user details from Better Auth for each user with a role
    const usersWithDetails = await Promise.all(
      userRoles.map(async (roleRecord) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const user = await ctx.db.get(roleRecord.userId as any);
          if (user) {
            return {
              _id: roleRecord.userId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name: (user as any).name || "Unknown",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              email: (user as any).email || "No email",
              role: roleRecord.role,
            };
          }
        } catch {
          // User not found in auth tables
        }
        return null;
      })
    );

    return usersWithDetails.filter((u) => u !== null);
  },
});

export const getAllUserRoles = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    return await ctx.db.query("userRoles").collect();
  },
});
