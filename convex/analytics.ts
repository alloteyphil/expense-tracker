import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { monthRange, monthsBackInclusive } from "./lib/dates";

export const monthSummary = query({
  args: {
    month: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const { start, end } = monthRange(args.month);
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).gte("date", start).lte("date", end),
      )
      .collect();

    const totalIncomeMinor = transactions
      .filter((row) => row.type === "income")
      .reduce((sum, row) => sum + row.amountMinor, 0);
    const totalExpenseMinor = transactions
      .filter((row) => row.type === "expense")
      .reduce((sum, row) => sum + row.amountMinor, 0);

    return {
      totalIncomeMinor,
      totalExpenseMinor,
      netBalanceMinor: totalIncomeMinor - totalExpenseMinor,
      transactionCount: transactions.length,
    };
  },
});

export const categoryBreakdown = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const { start, end } = monthRange(args.month);
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", user._id).gte("date", start).lte("date", end),
      )
      .collect();
    const expenses = transactions.filter((transaction) => transaction.type === "expense");
    const grouped = new Map<string, { categoryId: string; amountMinor: number; count: number }>();
    for (const transaction of expenses) {
      const existing = grouped.get(transaction.categoryId);
      if (existing) {
        existing.amountMinor += transaction.amountMinor;
        existing.count += 1;
        continue;
      }
      grouped.set(transaction.categoryId, {
        categoryId: transaction.categoryId,
        amountMinor: transaction.amountMinor,
        count: 1,
      });
    }
    return Array.from(grouped.values()).sort((a, b) => b.amountMinor - a.amountMinor);
  },
});

export const monthlyIncomeExpense = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const keys = monthsBackInclusive(args.month, 6);
    const result: { month: string; totalIncomeMinor: number; totalExpenseMinor: number }[] = [];
    for (const key of keys) {
      const { start, end } = monthRange(key);
      const rows = await ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", user._id).gte("date", start).lte("date", end),
        )
        .collect();
      result.push({
        month: key,
        totalIncomeMinor: rows
          .filter((row) => row.type === "income")
          .reduce((sum, row) => sum + row.amountMinor, 0),
        totalExpenseMinor: rows
          .filter((row) => row.type === "expense")
          .reduce((sum, row) => sum + row.amountMinor, 0),
      });
    }
    return result;
  },
});
