import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { monthKeyFromTimestamp } from "./lib/dates";

function nextOccurrence(current: number, interval: "weekly" | "monthly") {
  const date = new Date(current);
  if (interval === "weekly") {
    date.setUTCDate(date.getUTCDate() + 7);
  } else {
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return date.getTime();
}

export const materializeDue = internalMutation({
  args: {
    now: v.optional(v.number()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = args.now ?? Date.now();
    const batchSize = Math.min(Math.max(args.batchSize ?? 50, 1), 200);
    const due = await ctx.db
      .query("transactions")
      .withIndex("by_next_recurring_at", (q) => q.lte("nextRecurringAt", now))
      .take(batchSize);

    let created = 0;
    for (const tx of due) {
      if (!tx.isRecurring || !tx.recurringInterval || !tx.nextRecurringAt) continue;
      const nextDate = tx.nextRecurringAt;
      await ctx.db.insert("transactions", {
        userId: tx.userId,
        amountMinor: tx.amountMinor,
        type: tx.type,
        categoryId: tx.categoryId,
        note: tx.note,
        merchant: tx.merchant,
        date: nextDate,
        month: monthKeyFromTimestamp(nextDate),
        isRecurring: false,
        recurringInterval: null,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.patch(tx._id, {
        nextRecurringAt: nextOccurrence(nextDate, tx.recurringInterval),
        updatedAt: now,
      });
      created += 1;
    }
    return { scanned: due.length, created };
  },
});
