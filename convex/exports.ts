"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const transactionsCsv = action({
  args: {
    month: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ month: string; filename: string; csv: string }> => {
    const rows: {
      page: Array<{
        date: number;
        type: "income" | "expense";
        amountMinor: number;
        note?: string;
        merchant?: string;
        categoryId: string;
      }>;
    } = await ctx.runQuery(api.transactions.list, {
      paginationOpts: { numItems: 500, cursor: null },
      month: args.month,
    });
    const header = "date,type,amountMinor,note,merchant,categoryId";
    const lines: string[] = rows.page.map((row) =>
      [
        row.date,
        row.type,
        row.amountMinor,
        JSON.stringify(row.note ?? ""),
        JSON.stringify(row.merchant ?? ""),
        row.categoryId,
      ].join(","),
    );
    return {
      month: args.month,
      filename: `trackr-transactions-${args.month}.csv`,
      csv: [header, ...lines].join("\n"),
    };
  },
});
