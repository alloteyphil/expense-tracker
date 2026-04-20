import { describe, expect, it } from "vitest";
import { parseReceiptText } from "../lib/receipt-parser";

describe("receipt parser", () => {
  it("extracts amount, date, and merchant", () => {
    const parsed = parseReceiptText(
      "merchant: Koala amount: 120.50 date: 2026-04-20",
    );
    expect(parsed.amountMinor).toBe(12050);
    expect(parsed.extractedMerchant).toBe("Koala");
    expect(parsed.extractedDate).toBe(
      new Date("2026-04-20T00:00:00.000Z").getTime(),
    );
  });

  it("handles missing fields", () => {
    const parsed = parseReceiptText("random content");
    expect(parsed.amountMinor).toBeUndefined();
    expect(parsed.extractedMerchant).toBeUndefined();
    expect(parsed.extractedDate).toBeUndefined();
  });
});
