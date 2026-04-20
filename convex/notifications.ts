import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_and_created_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("budget"), v.literal("recurring"), v.literal("system")),
    month: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.insert("notifications", {
      userId: user._id,
      title: args.title,
      message: args.message,
      type: args.type,
      createdAt: Date.now(),
      metadata: { month: args.month, categoryId: args.categoryId },
    });
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Validation error: notification not found");
    }
    if (notification.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.notificationId, { readAt: Date.now() });
  },
});
