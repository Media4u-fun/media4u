import { mutation } from "./_generated/server";

// One-time script to create a test admin user with a known password
// Run with: npx convex run createTestAdmin:createAdmin
export const createAdmin = mutation({
  handler: async (ctx) => {
    const email = "testadmin@media4u.com";

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (existing) {
      // Just make sure they're admin
      const existingRole = await ctx.db
        .query("userRoles")
        .withIndex("by_userId", (q) => q.eq("userId", existing._id))
        .first();

      if (!existingRole) {
        await ctx.db.insert("userRoles", {
          userId: existing._id,
          role: "admin",
          createdAt: Date.now(),
        });
      } else if (existingRole.role !== "admin") {
        await ctx.db.patch(existingRole._id, { role: "admin" });
      }

      return {
        success: true,
        message: "User already exists and is now admin",
        email,
        note: "Use the signup page to set a password for this account",
      };
    }

    return {
      success: false,
      message: "User does not exist. Please sign up at /signup first with email: testadmin@media4u.com",
      email,
    };
  },
});
