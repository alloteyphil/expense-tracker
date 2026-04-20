import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { monthRange } from "./lib/dates";

export const upsert = mutation({
  args: {
    categoryId: v.id("categories"),
    month: v.string(),
    limitMinor: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (args.limitMinor <= 0) {
      throw new Error("Validation error: limitMinor must be greater than 0");
    }
    const category = await ctx.db.get(args.categoryId);
    if (!category || (category.userId !== null && category.userId !== user._id)) {
      throw new Error("Category not found");
    }

    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_category_and_month", (q) =>
        q.eq("userId", user._id).eq("categoryId", args.categoryId).eq("month", args.month),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { limitMinor: args.limitMinor, updatedAt: now });
      if (args.limitMinor <= 50000) {
        await ctx.db.insert("notifications", {
          userId: user._id,
          title: "Budget risk warning",
          message: "This budget limit is very low and may be exceeded quickly.",
          type: "budget_risk",
          severity: "medium",
          createdAt: now,
          metadata: { month: args.month, categoryId: args.categoryId },
        });
      }
      return existing._id;
    }
    const id = await ctx.db.insert("budgets", {
      userId: user._id,
      categoryId: args.categoryId,
      month: args.month,
      limitMinor: args.limitMinor,
      createdAt: now,
      updatedAt: now,
    });
    if (args.limitMinor <= 50000) {
      await ctx.db.insert("notifications", {
        userId: user._id,
        title: "Budget risk warning",
        message: "This budget limit is very low and may be exceeded quickly.",
        type: "budget_risk",
        severity: "medium",
        createdAt: now,
        metadata: { month: args.month, categoryId: args.categoryId },
      });
    }
    return id;
  },
});

export const listByMonth = query({
  args: {
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) => q.eq("userId", user._id).eq("month", args.month))
      .collect();
    const { start, end } = monthRange(args.month);
    const monthTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).gte("date", start).lte("date", end))
      .collect();

    return budgets.map((budget) => {
      const spentMinor = monthTransactions
        .filter((transaction) => transaction.type === "expense" && transaction.categoryId === budget.categoryId)
        .reduce((sum, transaction) => sum + transaction.amountMinor, 0);
      return {
        ...budget,
        spentMinor,
        usagePercent: budget.limitMinor === 0 ? 0 : Math.round((spentMinor / budget.limitMinor) * 100),
      };
    });
  },
});
