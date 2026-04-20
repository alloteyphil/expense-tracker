import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_created_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
    return rows.filter((row) => {
      if (args.unreadOnly && row.readAt) return false;
      if (args.severity && row.severity !== args.severity) return false;
      return true;
    });
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_created_at", (q) => q.eq("userId", user._id))
      .take(200);
    return rows.filter((row) => !row.readAt).length;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("budget"),
      v.literal("recurring"),
      v.literal("system"),
      v.literal("budget_risk"),
      v.literal("spend_spike"),
      v.literal("goal_slip"),
      v.literal("receipt_failed"),
    ),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    month: v.optional(v.string()),
    categoryId: v.optional(v.id("categories")),
    goalId: v.optional(v.id("goals")),
    receiptId: v.optional(v.id("receipts")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.insert("notifications", {
      userId: user._id,
      title: args.title,
      message: args.message,
      type: args.type,
      severity: args.severity ?? "medium",
      createdAt: Date.now(),
      metadata: {
        month: args.month,
        categoryId: args.categoryId,
        goalId: args.goalId,
        receiptId: args.receiptId,
      },
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
