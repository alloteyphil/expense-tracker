import type { Category, CategoryBudget, CategoryId, MonthlyTotals, Transaction } from "./types"

export const CATEGORIES: Category[] = [
  { id: "food", label: "Food & Drink", color: "var(--chart-1)", glyph: "🍲", applicableTo: ["expense"] },
  { id: "transport", label: "Transport", color: "var(--chart-3)", glyph: "🚖", applicableTo: ["expense"] },
  { id: "rent", label: "Rent & Bills", color: "var(--chart-5)", glyph: "🏠", applicableTo: ["expense"] },
  { id: "utilities", label: "Utilities", color: "var(--chart-2)", glyph: "💡", applicableTo: ["expense"] },
  { id: "shopping", label: "Shopping", color: "var(--chart-4)", glyph: "🛍️", applicableTo: ["expense"] },
  { id: "entertainment", label: "Entertainment", color: "var(--chart-2)", glyph: "🎬", applicableTo: ["expense"] },
  { id: "health", label: "Health", color: "var(--chart-3)", glyph: "🩺", applicableTo: ["expense"] },
  { id: "education", label: "Education", color: "var(--chart-5)", glyph: "📚", applicableTo: ["expense"] },
  { id: "salary", label: "Salary", color: "var(--chart-1)", glyph: "💼", applicableTo: ["income"] },
  { id: "freelance", label: "Freelance", color: "var(--chart-3)", glyph: "💻", applicableTo: ["income"] },
  { id: "gifts", label: "Gifts", color: "var(--chart-4)", glyph: "🎁", applicableTo: ["income", "expense"] },
  { id: "other", label: "Other", color: "var(--chart-5)", glyph: "•", applicableTo: ["income", "expense"] },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<CategoryId, Category>,
)

/**
 * Generate 20+ realistic transactions spread across the last ~3 months.
 * Amounts in GHS.
 */
function buildTransactions(): Transaction[] {
  const today = new Date()
  const d = (daysAgo: number) => {
    const x = new Date(today)
    x.setDate(x.getDate() - daysAgo)
    return x.toISOString().slice(0, 10)
  }

  const tx: Omit<Transaction, "id">[] = [
    // This month
    { date: d(0), type: "expense", categoryId: "food", amount: 45, note: "Waakye lunch at Osu" },
    { date: d(1), type: "expense", categoryId: "transport", amount: 25, note: "Trotro to Accra Mall" },
    { date: d(2), type: "income", categoryId: "freelance", amount: 1800, note: "Logo design — client payment" },
    { date: d(3), type: "expense", categoryId: "utilities", amount: 180, note: "ECG top-up" },
    { date: d(4), type: "expense", categoryId: "shopping", amount: 320, note: "Sneakers from Melcom" },
    { date: d(5), type: "expense", categoryId: "food", amount: 60, note: "Groceries at Shoprite" },
    { date: d(6), type: "expense", categoryId: "entertainment", amount: 90, note: "Silverbird movie night" },
    { date: d(7), type: "income", categoryId: "salary", amount: 4500, note: "Monthly salary" },
    { date: d(8), type: "expense", categoryId: "rent", amount: 1500, note: "Rent — East Legon flat" },
    { date: d(9), type: "expense", categoryId: "transport", amount: 40, note: "Uber to airport" },
    { date: d(11), type: "expense", categoryId: "health", amount: 250, note: "Pharmacy — monthly" },
    { date: d(13), type: "expense", categoryId: "food", amount: 35, note: "Jollof & kelewele" },
    { date: d(15), type: "expense", categoryId: "education", amount: 400, note: "Coursera subscription" },
    { date: d(16), type: "income", categoryId: "gifts", amount: 300, note: "Birthday gift from auntie" },

    // Last month
    { date: d(22), type: "expense", categoryId: "shopping", amount: 210, note: "New headphones" },
    { date: d(25), type: "expense", categoryId: "food", amount: 75, note: "Dinner at Buka" },
    { date: d(28), type: "income", categoryId: "salary", amount: 4500, note: "Monthly salary" },
    { date: d(30), type: "expense", categoryId: "rent", amount: 1500, note: "Rent" },
    { date: d(32), type: "expense", categoryId: "utilities", amount: 160, note: "Water bill" },
    { date: d(36), type: "expense", categoryId: "transport", amount: 55, note: "Fuel" },
    { date: d(40), type: "expense", categoryId: "entertainment", amount: 120, note: "Afrochella tickets" },
    { date: d(45), type: "income", categoryId: "freelance", amount: 900, note: "Website tweaks" },

    // 2 months ago
    { date: d(55), type: "expense", categoryId: "food", amount: 85 },
    { date: d(60), type: "income", categoryId: "salary", amount: 4500 },
    { date: d(62), type: "expense", categoryId: "rent", amount: 1500 },
    { date: d(68), type: "expense", categoryId: "health", amount: 180, note: "Dental checkup" },
    { date: d(72), type: "expense", categoryId: "shopping", amount: 140 },
  ]

  return tx
    .map((t, i) => ({ ...t, id: `tx_${String(i + 1).padStart(3, "0")}` }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export const MOCK_TRANSACTIONS: Transaction[] = buildTransactions()

/** Last 6 months of aggregated totals (oldest → newest). */
export function buildMonthlyTotals(txs: Transaction[]): MonthlyTotals[] {
  const now = new Date()
  const buckets: MonthlyTotals[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    buckets.push({
      monthKey,
      month: d.toLocaleDateString("en-GB", { month: "short" }),
      income: 0,
      expense: 0,
    })
  }

  for (const t of txs) {
    const key = t.date.slice(0, 7)
    const b = buckets.find((x) => x.monthKey === key)
    if (!b) continue
    if (t.type === "income") b.income += t.amount
    else b.expense += t.amount
  }

  // If some historical months have no data, seed with gentle mock values so the
  // chart always reads well in a demo environment.
  return buckets.map((b, i) => {
    if (b.income === 0 && b.expense === 0) {
      const base = 3800 + i * 180
      return { ...b, income: base + Math.round(Math.random() * 400), expense: base * 0.75 }
    }
    return b
  })
}

export const MOCK_BUDGETS: CategoryBudget[] = [
  { categoryId: "food", limit: 600, spent: 215 },
  { categoryId: "transport", limit: 300, spent: 120 },
  { categoryId: "rent", limit: 1500, spent: 1500 },
  { categoryId: "shopping", limit: 400, spent: 530 },
  { categoryId: "entertainment", limit: 200, spent: 90 },
  { categoryId: "utilities", limit: 250, spent: 180 },
]
