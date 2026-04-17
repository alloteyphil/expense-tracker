/**
 * Format a number as Ghanaian Cedi (GHS).
 * Uses the "GH₵" symbol which is the common locale display in Ghana.
 */
export function formatGHS(amount: number, opts: { compact?: boolean; showSign?: boolean } = {}): string {
  const { compact = false, showSign = false } = opts
  const abs = Math.abs(amount)

  const formatter = new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: compact && abs >= 1000 ? 0 : 2,
    maximumFractionDigits: compact && abs >= 1000 ? 1 : 2,
    notation: compact && abs >= 10000 ? "compact" : "standard",
  })

  const sign = showSign ? (amount > 0 ? "+" : amount < 0 ? "-" : "") : amount < 0 ? "-" : ""
  return `${sign}GH₵${formatter.format(abs)}`
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  })
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

export function formatDelta(pct: number): string {
  const sign = pct > 0 ? "+" : ""
  return `${sign}${pct.toFixed(1)}%`
}
