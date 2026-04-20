import test from "node:test";
import assert from "node:assert/strict";
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

test("monthKey returns zero-padded yyyy-mm", () => {
  assert.equal(monthKey(new Date("2026-04-20T00:00:00.000Z")), "2026-04");
  assert.equal(monthKey(new Date("2026-01-03T00:00:00.000Z")), "2026-01");
});

test("withinRange handles this-month and last-month", () => {
  const anchor = new Date("2026-04-20T00:00:00.000Z");
  assert.equal(withinRange(tx("2026-04-01"), "this-month", anchor), true);
  assert.equal(withinRange(tx("2026-03-31"), "this-month", anchor), false);
  assert.equal(withinRange(tx("2026-03-15"), "last-month", anchor), true);
  assert.equal(withinRange(tx("2026-02-15"), "last-month", anchor), false);
});

test("withinRange handles rolling three-month window", () => {
  const anchor = new Date("2026-04-20T00:00:00.000Z");
  assert.equal(withinRange(tx("2026-02-01"), "3-months", anchor), true);
  assert.equal(withinRange(tx("2026-04-30"), "3-months", anchor), true);
  assert.equal(withinRange(tx("2026-01-31"), "3-months", anchor), false);
});
