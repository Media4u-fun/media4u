import { query, action } from "./_generated/server";
import { requireAdmin } from "./auth";
import { v } from "convex/values";

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

export const createUser = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("admin"), v.literal("user"), v.literal("client")),
  },
  handler: async (ctx, args) => {
    // Verify caller is admin (using internal mutation)
    await ctx.runMutation(async (ctx) => {
      await requireAdmin(ctx);
    });

    // Call the Better Auth signup endpoint to create the user
    const response = await fetch(`${process.env.CONVEX_SITE_URL}/api/auth/sign-up`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: args.email,
        password: args.password,
        name: args.name,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create user: ${error}`);
    }

    const data = await response.json();
    const userId = data.user?.id;

    if (!userId) {
      throw new Error("User created but no ID returned");
    }

    // Set the user's role
    await ctx.runMutation(async (ctx) => {
      const existing = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { role: args.role });
      } else {
        await ctx.db.insert("userRoles", {
          userId,
          role: args.role,
          createdAt: Date.now(),
        });
      }
    });

    return { success: true, userId };
  },
});
