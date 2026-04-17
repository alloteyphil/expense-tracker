"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Header } from "@/components/trackr/header"
import { KpiCard } from "@/components/trackr/kpi-card"
import { IncomeExpenseChart } from "@/components/trackr/income-expense-chart"
import { CategoryChart } from "@/components/trackr/category-chart"
import { TransactionsList } from "@/components/trackr/transactions-list"
import { AddTransactionCard } from "@/components/trackr/add-transaction-card"
import { BudgetProgressCard } from "@/components/trackr/budget-progress-card"
import { QuickFiltersCard } from "@/components/trackr/quick-filters-card"
import { ErrorBanner } from "@/components/trackr/error-banner"
import { ChartSkeleton, KpiCardSkeleton, TableSkeleton } from "@/components/trackr/skeletons"
import { CATEGORY_MAP, MOCK_BUDGETS, MOCK_TRANSACTIONS, buildMonthlyTotals } from "@/lib/mock-data"
import { formatGHS, formatMonthYear } from "@/lib/format"
import type { CategoryBudget, Kpi, QuickFilters, Transaction } from "@/lib/types"

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function inMonth(tx: Transaction, d: Date) {
  return tx.date.slice(0, 7) === monthKey(d)
}

function withinRange(tx: Transaction, range: QuickFilters["range"], anchor: Date): boolean {
  if (range === "all") return true
  const d = new Date(tx.date)
  if (range === "this-month") return inMonth(tx, anchor)
  if (range === "last-month") {
    const last = new Date(anchor)
    last.setMonth(last.getMonth() - 1)
    return inMonth(tx, last)
  }
  // 3 months (including current)
  const start = new Date(anchor.getFullYear(), anchor.getMonth() - 2, 1)
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59)
  return d >= start && d <= end
}

function buildSpark(values: number[]): number[] {
  if (values.length >= 8) return values.slice(-10)
  // pad with soft variations
  const base = values[0] ?? 100
  return Array.from({ length: 8 }, (_, i) => base * (0.9 + Math.random() * 0.25) + i * 4)
}

export default function DashboardPage() {
  const [month, setMonth] = useState<Date>(() => new Date())
  const [search, setSearch] = useState("")
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [budgets] = useState<CategoryBudget[]>(MOCK_BUDGETS)
  const [filters, setFilters] = useState<QuickFilters>({
    type: "all",
    categoryId: "all",
    range: "this-month",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate initial data load so skeletons render briefly
  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(id)
  }, [])

  // Show a one-time over-budget toast on mount (UI demo of the warning)
  useEffect(() => {
    if (loading) return
    const over = budgets.find((b) => b.spent >= b.limit)
    if (!over) return
    const cat = CATEGORY_MAP[over.categoryId]
    const pct = Math.round((over.spent / over.limit) * 100)
    toast.warning(`${cat?.label} is at ${pct}% of budget`, {
      description: `You've spent ${formatGHS(over.spent)} of ${formatGHS(over.limit)} this month.`,
      duration: 6000,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  /* ---------- Derived data ---------- */

  const monthlyTotals = useMemo(() => buildMonthlyTotals(transactions), [transactions])

  const thisMonthTxs = useMemo(
    () => transactions.filter((t) => inMonth(t, month)),
    [transactions, month],
  )

  const lastMonthTxs = useMemo(() => {
    const last = new Date(month)
    last.setMonth(last.getMonth() - 1)
    return transactions.filter((t) => inMonth(t, last))
  }, [transactions, month])

  const totals = useMemo(() => {
    const sum = (arr: Transaction[], type: "income" | "expense") =>
      arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)
    return {
      income: sum(thisMonthTxs, "income"),
      expense: sum(thisMonthTxs, "expense"),
      lastIncome: sum(lastMonthTxs, "income"),
      lastExpense: sum(lastMonthTxs, "expense"),
    }
  }, [thisMonthTxs, lastMonthTxs])

  const budgetUsagePct = useMemo(() => {
    const limit = budgets.reduce((s, b) => s + b.limit, 0)
    const spent = budgets.reduce((s, b) => s + b.spent, 0)
    return limit > 0 ? (spent / limit) * 100 : 0
  }, [budgets])

  const kpis: Kpi[] = useMemo(() => {
    const pct = (now: number, prev: number) => {
      if (prev === 0) return now === 0 ? 0 : 100
      return ((now - prev) / prev) * 100
    }
    const incomeSpark = monthlyTotals.map((m) => m.income)
    const expenseSpark = monthlyTotals.map((m) => m.expense)
    const netSpark = monthlyTotals.map((m) => m.income - m.expense)
    const net = totals.income - totals.expense
    const lastNet = totals.lastIncome - totals.lastExpense

    return [
      {
        label: "Total Income",
        value: totals.income,
        delta: pct(totals.income, totals.lastIncome),
        spark: buildSpark(incomeSpark),
        tone: "success",
      },
      {
        label: "Total Expenses",
        value: totals.expense,
        delta: pct(totals.expense, totals.lastExpense),
        spark: buildSpark(expenseSpark),
        tone: "danger",
      },
      {
        label: "Net Balance",
        value: net,
        delta: pct(net, lastNet),
        spark: buildSpark(netSpark),
        tone: net >= 0 ? "success" : "danger",
      },
      {
        label: "Budget Usage",
        value: Math.round(budgetUsagePct),
        delta: budgetUsagePct - 75,
        spark: buildSpark([60, 65, 70, 72, 74, budgetUsagePct]),
        tone: budgetUsagePct >= 100 ? "danger" : budgetUsagePct >= 80 ? "warning" : "neutral",
      },
    ]
  }, [totals, monthlyTotals, budgetUsagePct])

  // Transactions filtered for the list (respects quick filters + header search)
  const filteredForList = useMemo(() => {
    return transactions.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false
      if (filters.categoryId !== "all" && t.categoryId !== filters.categoryId) return false
      if (!withinRange(t, filters.range, month)) return false
      return true
    })
  }, [transactions, filters, month])

  /* ---------- Handlers ---------- */

  const handleAdd = (tx: Omit<Transaction, "id">) => {
    const id = `tx_${Date.now().toString(36)}`
    setTransactions((prev) => [{ ...tx, id }, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)))
    toast.success(tx.type === "income" ? "Income added" : "Expense added", {
      description: `${formatGHS(tx.amount)} · ${CATEGORY_MAP[tx.categoryId]?.label}`,
    })
  }

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast("Transaction deleted")
  }

  const scrollToAdd = () => {
    const el = document.getElementById("add-transaction")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      el.querySelector<HTMLInputElement>('input[type="number"]')?.focus()
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <Header
        month={month}
        onMonthChange={setMonth}
        search={search}
        onSearchChange={setSearch}
        onAddTransaction={scrollToAdd}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Optional error demo banner (wired but hidden by default) */}
        {error && (
          <div className="mb-6">
            <ErrorBanner description={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Page title */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatMonthYear(month)} · GHS
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {transactions.length} transactions tracked
          </p>
        </div>

        {/* KPIs */}
        <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
            : kpis.map((k) => (
                <KpiCard key={k.label} kpi={k} asPercent={k.label === "Budget Usage"} />
              ))}
        </section>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column 2/3 */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {loading ? <ChartSkeleton /> : <IncomeExpenseChart data={monthlyTotals} />}
            {loading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <CategoryChart transactions={thisMonthTxs} monthLabel={formatMonthYear(month)} />
            )}
            {loading ? (
              <TableSkeleton />
            ) : (
              <TransactionsList
                transactions={filteredForList}
                globalSearch={search}
                onDelete={handleDelete}
                onAddFirst={scrollToAdd}
              />
            )}
          </div>

          {/* Right column 1/3 */}
          <aside className="flex flex-col gap-6">
            <div id="add-transaction" className="scroll-mt-24">
              {loading ? <ChartSkeleton height="h-64" /> : <AddTransactionCard onAdd={handleAdd} />}
            </div>
            {loading ? <ChartSkeleton height="h-56" /> : <BudgetProgressCard budgets={budgets} />}
            {loading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <QuickFiltersCard filters={filters} onChange={setFilters} />
            )}
          </aside>
        </div>

        <footer className="mt-10 border-t border-border pt-6 pb-2 text-center text-xs text-muted-foreground">
          Trackr · Built for Ghana 🇬🇭 · Clerk & Convex integration coming soon
        </footer>
      </main>
    </div>
  )
}
