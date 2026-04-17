import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const currencyValidator = v.union(v.literal("USD"), v.literal("EUR"), v.literal("INR"));

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);

    return await ctx.db
      .query("expenses")
      .withIndex("by_user_and_spent_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

export const create = mutation({
  args: {
    amount: v.number(),
    currency: currencyValidator,
    spentAt: v.number(),
    categoryId: v.optional(v.id("categories")),
    note: v.optional(v.string()),
    merchant: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.insert("expenses", {
      userId: user._id,
      amount: args.amount,
      currency: args.currency,
      spentAt: args.spentAt,
      categoryId: args.categoryId,
      note: args.note,
      merchant: args.merchant,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    expenseId: v.id("expenses"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const expense = await ctx.db.get(args.expenseId);
    if (!expense) {
      throw new Error("Expense not found");
    }
    if (expense.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.expenseId);
  },
});
