import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./auth";

// Public: get approved comments for a specific community member
export const getApprovedComments = query({
  args: { memberId: v.id("communityMembers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("communityComments")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .filter((q) => q.eq(q.field("approved"), true))
      .order("asc")
      .collect();
  },
});

// Public: get approved comment count for a specific community member
export const getApprovedCommentCount = query({
  args: { memberId: v.id("communityMembers") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("communityComments")
      .withIndex("by_memberId", (q) => q.eq("memberId", args.memberId))
      .filter((q) => q.eq(q.field("approved"), true))
      .collect();
    return comments.length;
  },
});

// Public: submit a new comment (pending approval)
export const submitComment = mutation({
  args: {
    memberId: v.id("communityMembers"),
    authorName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("communityComments", {
      memberId: args.memberId,
      authorName: args.authorName.trim(),
      content: args.content.trim(),
      approved: false,
      createdAt: Date.now(),
    });
  },
});

// Admin: get all pending (unapproved) comments
export const getPendingComments = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const comments = await ctx.db
      .query("communityComments")
      .withIndex("by_approved", (q) => q.eq("approved", false))
      .order("desc")
      .collect();

    // Attach member info for context
    const withMemberInfo = await Promise.all(
      comments.map(async (comment) => {
        const member = await ctx.db.get(comment.memberId);
        return {
          ...comment,
          memberName: member?.name ?? "Unknown",
          worldName: member?.worldName ?? "Unknown",
        };
      })
    );

    return withMemberInfo;
  },
});

// Admin: get all approved comments
export const getApprovedCommentsAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const comments = await ctx.db
      .query("communityComments")
      .withIndex("by_approved", (q) => q.eq("approved", true))
      .order("desc")
      .collect();

    const withMemberInfo = await Promise.all(
      comments.map(async (comment) => {
        const member = await ctx.db.get(comment.memberId);
        return {
          ...comment,
          memberName: member?.name ?? "Unknown",
          worldName: member?.worldName ?? "Unknown",
        };
      })
    );

    return withMemberInfo;
  },
});

// Admin: approve a comment
export const approveComment = mutation({
  args: { id: v.id("communityComments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { approved: true });
  },
});

// Admin: delete a comment
export const deleteComment = mutation({
  args: { id: v.id("communityComments") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
