"use node";

import { createWorker } from "tesseract.js";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

type OcrParsed = {
  amountMinor?: number;
  extractedDate?: number;
  extractedMerchant?: string;
};

type OcrActionResult =
  | {
      ok: true;
      parsed: OcrParsed;
      extractedTextLength: number;
    }
  | {
      ok: false;
      reason: string;
    };

export const parseUploadedReceipt = action({
  args: { receiptId: v.id("receipts") },
  handler: async (ctx, args): Promise<OcrActionResult> => {
    try {
      const receipt = await ctx.runQuery(api.receipts.getForOcr, {
        receiptId: args.receiptId,
      });
      const worker = await createWorker("eng");
      const result = await worker.recognize(receipt.fileUrl);
      await worker.terminate();
      const extractedText = result.data.text?.trim();
      if (!extractedText) {
        await ctx.runMutation(api.receipts.markFailed, {
          receiptId: args.receiptId,
          reason: "OCR could not extract text",
        });
        return { ok: false, reason: "no_text" };
      }
      const parsed: OcrParsed = await ctx.runMutation(api.receipts.parseDraft, {
        receiptId: args.receiptId,
        extractedText,
      });
      return {
        ok: true,
        parsed,
        extractedTextLength: extractedText.length,
      };
    } catch (error) {
      await ctx.runMutation(api.receipts.markFailed, {
        receiptId: args.receiptId,
        reason: error instanceof Error ? error.message : "OCR failed",
      });
      return {
        ok: false,
        reason: error instanceof Error ? error.message : "OCR failed",
      };
    }
  },
});
