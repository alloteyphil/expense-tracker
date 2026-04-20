import { describe, expect, it } from "vitest";
import { monthKey, withinRange } from "../lib/trackr";
import type { Transaction } from "../lib/types";

function tx(date: string): Transaction {
  return {
    id: "tx",
    type: "expense",
    categoryId: "cat",
    amount: 42,
    date,
  };
}

describe("trackr date helpers", () => {
  it("monthKey returns zero-padded yyyy-mm", () => {
    expect(monthKey(new Date("2026-04-20T00:00:00.000Z"))).toBe("2026-04");
    expect(monthKey(new Date("2026-01-03T00:00:00.000Z"))).toBe("2026-01");
  });

  it("withinRange handles this-month and last-month", () => {
    const anchor = new Date("2026-04-20T00:00:00.000Z");
    expect(withinRange(tx("2026-04-01"), "this-month", anchor)).toBe(true);
    expect(withinRange(tx("2026-03-31"), "this-month", anchor)).toBe(false);
    expect(withinRange(tx("2026-03-15"), "last-month", anchor)).toBe(true);
    expect(withinRange(tx("2026-02-15"), "last-month", anchor)).toBe(false);
  });

  it("withinRange handles rolling three-month window", () => {
    const anchor = new Date("2026-04-20T00:00:00.000Z");
    expect(withinRange(tx("2026-02-01"), "3-months", anchor)).toBe(true);
    expect(withinRange(tx("2026-04-30"), "3-months", anchor)).toBe(true);
    expect(withinRange(tx("2026-01-31"), "3-months", anchor)).toBe(false);
  });
});
