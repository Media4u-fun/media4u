import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to check if a user is an admin
export const isAdmin = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    return userRole?.role === "admin";
  },
});

// Mutation to promote a user to admin (for development/initial setup)
export const promoteToAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Find the user by email in the Better Auth users table
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!user) {
      throw new Error(`User with email ${email} not found. Make sure you've signed up first.`);
    }

    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    if (existingRole) {
      if (existingRole.role === "admin") {
        return { success: true, message: "User is already an admin" };
      }
      // Update existing role
      await ctx.db.patch(existingRole._id, { role: "admin" });
      return { success: true, message: "User promoted to admin" };
    }

    // Create new admin role
    await ctx.db.insert("userRoles", {
      userId: user._id,
      role: "admin",
      createdAt: Date.now(),
    });

    return { success: true, message: "User promoted to admin successfully" };
  },
});

// Mutation to list all users (helpful for debugging)
export const listAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const userRoles = await ctx.db.query("userRoles").collect();

    return users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      role: userRoles.find(r => r.userId === user._id)?.role || "user",
    }));
  },
});

// Find user by exact email
export const findUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (!user) {
      return null;
    }

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      role: userRole?.role || "user",
    };
  },
});
