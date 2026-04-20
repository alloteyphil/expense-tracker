import type { QuickFilters, Transaction } from "@/lib/types";

export function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function toDateString(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function withinRange(
  tx: Transaction,
  range: QuickFilters["range"],
  anchor: Date,
): boolean {
  if (range === "all") return true;
  const date = new Date(tx.date);
  if (range === "this-month") return tx.date.slice(0, 7) === monthKey(anchor);
  if (range === "last-month") {
    const last = new Date(anchor);
    last.setMonth(last.getMonth() - 1);
    return tx.date.slice(0, 7) === monthKey(last);
  }
  const start = new Date(anchor.getFullYear(), anchor.getMonth() - 2, 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59);
  return date >= start && date <= end;
}
