import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { monthKeyFromTimestamp } from "./lib/dates";

const typeValidator = v.union(v.literal("income"), v.literal("expense"));
const recurringValidator = v.union(v.literal("weekly"), v.literal("monthly"), v.null());

export const create = mutation({
  args: {
    amountMinor: v.number(),
    type: typeValidator,
    categoryId: v.id("categories"),
    note: v.optional(v.string()),
    merchant: v.optional(v.string()),
    date: v.number(),
    isRecurring: v.optional(v.boolean()),
    recurringInterval: v.optional(recurringValidator),
    tagIds: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (args.amountMinor <= 0) {
      throw new Error("Validation error: amountMinor must be greater than 0");
    }
    const category = await ctx.db.get(args.categoryId);
    if (!category || (category.userId !== null && category.userId !== user._id)) {
      throw new Error("Category not found");
    }
    const now = Date.now();
    const isRecurring = args.isRecurring ?? false;
    const recurringInterval = isRecurring ? (args.recurringInterval ?? "monthly") : null;
    const id = await ctx.db.insert("transactions", {
      userId: user._id,
      amountMinor: args.amountMinor,
      type: args.type,
      categoryId: args.categoryId,
      note: args.note,
      merchant: args.merchant,
      date: args.date,
      month: monthKeyFromTimestamp(args.date),
      isRecurring,
      recurringInterval,
      nextRecurringAt: isRecurring ? args.date : undefined,
      createdAt: now,
      updatedAt: now,
    });

    if (args.tagIds && args.tagIds.length > 0) {
      for (const tagId of args.tagIds) {
        const tag = await ctx.db.get(tagId);
        if (!tag || tag.userId !== user._id) {
          throw new Error("Validation error: invalid tag");
        }
        await ctx.db.insert("transactionTags", { userId: user._id, transactionId: id, tagId });
      }
    }

    if (args.type === "expense" && args.amountMinor >= 200000) {
      await ctx.db.insert("notifications", {
        userId: user._id,
        title: "Spend spike detected",
        message: `Large expense of ${(args.amountMinor / 100).toFixed(2)} recorded.`,
        type: "spend_spike",
        severity: "high",
        createdAt: now,
      });
    }
    return id;
  },
});

export const update = mutation({
  args: {
    transactionId: v.id("transactions"),
    amountMinor: v.optional(v.number()),
    type: v.optional(typeValidator),
    categoryId: v.optional(v.id("categories")),
    note: v.optional(v.string()),
    merchant: v.optional(v.string()),
    date: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    recurringInterval: v.optional(recurringValidator),
    tagIds: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    if (transaction.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    if (args.amountMinor !== undefined && args.amountMinor <= 0) {
      throw new Error("Validation error: amountMinor must be greater than 0");
    }
    if (args.categoryId) {
      const category = await ctx.db.get(args.categoryId);
      if (!category || (category.userId !== null && category.userId !== user._id)) {
        throw new Error("Category not found");
      }
    }

    const nextDate = args.date ?? transaction.date;
    const isRecurring = args.isRecurring ?? transaction.isRecurring;
    const recurringInterval = isRecurring
      ? (args.recurringInterval ?? transaction.recurringInterval ?? "monthly")
      : null;

    await ctx.db.patch(args.transactionId, {
      amountMinor: args.amountMinor ?? transaction.amountMinor,
      type: args.type ?? transaction.type,
      categoryId: args.categoryId ?? transaction.categoryId,
      note: args.note ?? transaction.note,
      merchant: args.merchant ?? transaction.merchant,
      date: nextDate,
      month: monthKeyFromTimestamp(nextDate),
      isRecurring,
      recurringInterval,
      nextRecurringAt: isRecurring ? (transaction.nextRecurringAt ?? nextDate) : undefined,
      updatedAt: Date.now(),
    });

    if (args.tagIds) {
      const existingLinks = await ctx.db
        .query("transactionTags")
        .withIndex("by_user_and_transaction", (q) =>
          q.eq("userId", user._id).eq("transactionId", args.transactionId),
        )
        .collect();
      for (const link of existingLinks) {
        await ctx.db.delete(link._id);
      }
      for (const tagId of args.tagIds) {
        const tag = await ctx.db.get(tagId);
        if (!tag || tag.userId !== user._id) {
          throw new Error("Validation error: invalid tag");
        }
        await ctx.db.insert("transactionTags", {
          userId: user._id,
          transactionId: args.transactionId,
          tagId,
        });
      }
    }
  },
});

export const remove = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    if (transaction.userId !== user._id) {
      throw new Error("Unauthorized");
    }
    const links = await ctx.db
      .query("transactionTags")
      .withIndex("by_user_and_transaction", (q) =>
        q.eq("userId", user._id).eq("transactionId", args.transactionId),
      )
      .collect();
    for (const link of links) {
      await ctx.db.delete(link._id);
    }
    await ctx.db.delete(args.transactionId);
  },
});

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    month: v.optional(v.string()),
    type: v.optional(typeValidator),
    categoryId: v.optional(v.id("categories")),
    search: v.optional(v.string()),
    tagId: v.optional(v.id("tags")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const page = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    const filtered = [];
    for (const transaction of page.page) {
      if (args.month && transaction.month !== args.month) continue;
      if (args.type && transaction.type !== args.type) continue;
      if (args.categoryId && transaction.categoryId !== args.categoryId) continue;
      if (args.search) {
        const hay = `${transaction.note ?? ""} ${transaction.merchant ?? ""}`.toLowerCase();
        if (!hay.includes(args.search.toLowerCase())) continue;
      }
      if (args.tagId) {
        const tagLinks = await ctx.db
          .query("transactionTags")
          .withIndex("by_user_and_transaction", (q) =>
            q.eq("userId", user._id).eq("transactionId", transaction._id),
          )
          .collect();
        if (!tagLinks.some((link) => link.tagId === args.tagId)) continue;
      }
      filtered.push(transaction);
    }

    return {
      ...page,
      page: filtered,
    };
  },
});

export const backfillFromExpenses = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200);
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_user_and_spent_at", (q) => q.eq("userId", user._id))
      .order("asc")
      .take(limit);

    let inserted = 0;
    for (const expense of expenses) {
      const already = await ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", expense.spentAt))
        .collect();
      if (already.some((transaction) => transaction.sourceExpenseId === expense._id)) {
        continue;
      }
      if (!expense.categoryId) {
        continue;
      }
      await ctx.db.insert("transactions", {
        userId: user._id,
        amountMinor: Math.round(expense.amount * 100),
        type: "expense",
        categoryId: expense.categoryId,
        note: expense.note,
        merchant: expense.merchant,
        date: expense.spentAt,
        month: monthKeyFromTimestamp(expense.spentAt),
        isRecurring: false,
        recurringInterval: null,
        sourceExpenseId: expense._id,
        createdAt: expense.createdAt,
        updatedAt: expense.createdAt,
      });
      inserted += 1;
    }
    return { scanned: expenses.length, inserted };
  },
});
