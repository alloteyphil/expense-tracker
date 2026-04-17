import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

export const monthlySummary = query({
  args: {
    rangeStart: v.number(),
    rangeEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_spent_at", (q) =>
        q.eq("userId", user._id).gte("spentAt", args.rangeStart).lte("spentAt", args.rangeEnd),
      )
      .collect();

    const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageSpend = expenses.length === 0 ? 0 : totalSpend / expenses.length;

    return {
      totalTransactions: expenses.length,
      totalSpend,
      averageSpend,
    };
  },
});
