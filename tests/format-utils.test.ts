import { describe, expect, it } from "vitest";
import { formatDateLong, formatDateShort, formatDelta, formatGHS, formatMonthYear } from "../lib/format";

describe("format helpers", () => {
  it("formats GHS currency in standard mode", () => {
    expect(formatGHS(12.5)).toBe("GH₵12.50");
    expect(formatGHS(-12.5)).toBe("-GH₵12.50");
  });

  it("formats GHS with compact mode and explicit sign", () => {
    expect(formatGHS(10500, { compact: true })).toMatch(/^GH₵10(\.|,)5K$/);
    expect(formatGHS(120.2, { showSign: true })).toBe("+GH₵120.20");
  });

  it("formats date helpers consistently", () => {
    expect(formatDateShort("2026-04-20")).toMatch(/20 Apr/);
    expect(formatDateLong("2026-04-20")).toMatch(/20 Apr 2026/);
    expect(formatMonthYear(new Date("2026-04-20T00:00:00.000Z"))).toMatch(/April 2026/);
  });

  it("formats deltas with sign for positives", () => {
    expect(formatDelta(3.25)).toBe("+3.3%");
    expect(formatDelta(-2.11)).toBe("-2.1%");
  });
});
