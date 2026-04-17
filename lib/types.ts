export type TransactionType = "income" | "expense"

export type CategoryId =
  | "food"
  | "transport"
  | "rent"
  | "utilities"
  | "shopping"
  | "entertainment"
  | "health"
  | "education"
  | "salary"
  | "freelance"
  | "gifts"
  | "other"

export interface Category {
  id: CategoryId
  label: string
  /** CSS var reference, e.g. "var(--chart-1)" */
  color: string
  /** Emoji or short glyph for lightweight visual (not used as an icon replacement) */
  glyph: string
  applicableTo: TransactionType[]
}

export interface Transaction {
  id: string
  date: string // ISO yyyy-mm-dd
  type: TransactionType
  categoryId: CategoryId
  amount: number // in GHS, positive number
  note?: string
}

export interface MonthlyTotals {
  month: string // e.g. "Jan"
  monthKey: string // e.g. "2025-01"
  income: number
  expense: number
}

export interface CategoryBudget {
  categoryId: CategoryId
  limit: number // GHS
  spent: number // GHS
}

export type DateRangeId = "this-month" | "last-month" | "3-months" | "all"

export interface QuickFilters {
  type: TransactionType | "all"
  categoryId: CategoryId | "all"
  range: DateRangeId
}

export interface Kpi {
  label: string
  value: number
  /** Percent change vs previous period, e.g. 12 or -3.2 */
  delta: number
  /** Sparkline series, 8-12 points */
  spark: number[]
  tone: "neutral" | "success" | "danger" | "warning"
}
