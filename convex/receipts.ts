import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getUserActiveHousehold } from "./lib/auth";
import { parseReceiptText } from "../lib/receipt-parser";

export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 100);
    return await ctx.db
      .query("receipts")
      .withIndex("by_user_and_created_at", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

export const createUpload = mutation({
  args: {
    fileName: v.string(),
    contentType: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const householdCtx = await getUserActiveHousehold(ctx, user._id);
    const now = Date.now();
    return await ctx.db.insert("receipts", {
      userId: user._id,
      householdId: householdCtx?.household._id,
      storageId: args.storageId,
      fileName: args.fileName,
      contentType: args.contentType,
      status: "uploaded",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const parseDraft = mutation({
  args: {
    receiptId: v.id("receipts"),
    extractedText: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) throw new Error("Receipt not found");
    if (receipt.userId !== user._id) throw new Error("Unauthorized");
    const parsed = parseReceiptText(args.extractedText);
    const status = parsed.amountMinor ? "parsed" : "needs_review";
    await ctx.db.patch(receipt._id, {
      status,
      extractedAmountMinor: parsed.amountMinor,
      extractedDate: parsed.extractedDate,
      extractedMerchant: parsed.extractedMerchant,
      parserNotes: parsed.amountMinor ? "Amount parsed" : "Unable to parse amount",
      updatedAt: Date.now(),
    });
    return parsed;
  },
});

export const getForOcr = query({
  args: { receiptId: v.id("receipts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) throw new Error("Receipt not found");
    if (receipt.userId !== user._id) throw new Error("Unauthorized");
    if (!receipt.storageId) {
      throw new Error("Receipt file is missing");
    }
    const fileUrl = await ctx.storage.getUrl(receipt.storageId);
    if (!fileUrl) {
      throw new Error("Receipt file is unavailable");
    }
    return {
      receiptId: receipt._id,
      fileName: receipt.fileName,
      fileUrl,
    };
  },
});

export const markFailed = mutation({
  args: { receiptId: v.id("receipts"), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const receipt = await ctx.db.get(args.receiptId);
    if (!receipt) throw new Error("Receipt not found");
    if (receipt.userId !== user._id) throw new Error("Unauthorized");
    await ctx.db.patch(receipt._id, {
      status: "failed",
      parserNotes: args.reason ?? "Processing failed",
      updatedAt: Date.now(),
    });
    await ctx.db.insert("notifications", {
      userId: user._id,
      householdId: receipt.householdId,
      title: "Receipt processing failed",
      message: args.reason ?? "We could not parse this receipt. Please review manually.",
      type: "receipt_failed",
      severity: "low",
      createdAt: Date.now(),
      metadata: { receiptId: receipt._id },
    });
  },
});
