"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/trackr/header";
import { KpiCard } from "@/components/trackr/kpi-card";
import { IncomeExpenseChart } from "@/components/trackr/income-expense-chart";
import { CategoryChart } from "@/components/trackr/category-chart";
import { TransactionsList } from "@/components/trackr/transactions-list";
import { AddTransactionCard } from "@/components/trackr/add-transaction-card";
import { BudgetProgressCard } from "@/components/trackr/budget-progress-card";
import { QuickFiltersCard } from "@/components/trackr/quick-filters-card";
import { ErrorBanner } from "@/components/trackr/error-banner";
import {
  ChartSkeleton,
  KpiCardSkeleton,
  TableSkeleton,
} from "@/components/trackr/skeletons";
import { Button } from "@/components/ui/button";
import { formatMonthYear } from "@/lib/format";
import type {
  Category,
  CategoryBudget,
  Kpi,
  MonthlyTotals,
  QuickFilters,
  Transaction,
} from "@/lib/types";

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function toDateString(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function withinRange(
  tx: Transaction,
  range: QuickFilters["range"],
  anchor: Date,
): boolean {
  if (range === "all") return true;
  const d = new Date(tx.date);
  if (range === "this-month") return tx.date.slice(0, 7) === monthKey(anchor);
  if (range === "last-month") {
    const last = new Date(anchor);
    last.setMonth(last.getMonth() - 1);
    return tx.date.slice(0, 7) === monthKey(last);
  }
  const start = new Date(anchor.getFullYear(), anchor.getMonth() - 2, 1);
  const end = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  return d >= start && d <= end;
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [userReady, setUserReady] = useState(false);
  const [month, setMonth] = useState<Date>(() => new Date());
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<QuickFilters>({
    type: "all",
    categoryId: "all",
    range: "this-month",
  });
  const [error, setError] = useState<string | null>(null);

  const monthId = monthKey(month);
  const storeUser = useMutation(api.users.store);
  const seedDefaults = useMutation(api.categories.seedDefaults);
  const createTransaction = useMutation(api.transactions.create);
  const removeTransaction = useMutation(api.transactions.remove);
  const createNotification = useMutation(api.notifications.create);
  const exportCsv = useAction(api.exports.transactionsCsv);

  const canQuery = isSignedIn && userReady;
  const categoriesRaw = useQuery(api.categories.list, canQuery ? {} : "skip");
  const listResponse = useQuery(
    api.transactions.list,
    canQuery ? { paginationOpts: { numItems: 100, cursor: null } } : "skip",
  );
  const monthSummary = useQuery(
    api.analytics.monthSummary,
    canQuery ? { month: monthId } : "skip",
  );
  const monthSeries = useQuery(
    api.analytics.monthlyIncomeExpense,
    canQuery ? { month: monthId } : "skip",
  );
  const budgetsRaw = useQuery(
    api.budgets.listByMonth,
    canQuery ? { month: monthId } : "skip",
  );

  const loading =
    categoriesRaw === undefined ||
    listResponse === undefined ||
    monthSummary === undefined ||
    monthSeries === undefined ||
    budgetsRaw === undefined;

  useEffect(() => {
    if (!isSignedIn) return;
    const init = async () => {
      try {
        await storeUser({});
        await seedDefaults({});
        setUserReady(true);
      } catch (initError) {
        setUserReady(false);
        setError(
          initError instanceof Error
            ? initError.message
            : "Initialization failed",
        );
      }
    };
    void init();
  }, [isSignedIn, seedDefaults, storeUser]);

  const categories: Category[] = useMemo(
    () =>
      (categoriesRaw ?? []).map((category) => ({
        id: category._id,
        label: category.name,
        color: category.color,
        glyph: category.icon,
        applicableTo: category.name.toLowerCase().includes("salary")
          ? ["income"]
          : ["income", "expense"],
      })),
    [categoriesRaw],
  );

  const transactions: Transaction[] = useMemo(
    () =>
      (listResponse?.page ?? []).map((row) => ({
        id: row._id,
        date: toDateString(row.date),
        type: row.type,
        categoryId: row.categoryId,
        amount: row.amountMinor / 100,
        note: row.note,
      })),
    [listResponse],
  );

  const budgets: CategoryBudget[] = useMemo(
    () =>
      (budgetsRaw ?? []).map((row) => ({
        categoryId: row.categoryId,
        limit: row.limitMinor / 100,
        spent: row.spentMinor / 100,
      })),
    [budgetsRaw],
  );

  const chartData: MonthlyTotals[] = useMemo(
    () =>
      (monthSeries ?? []).map((row) => ({
        monthKey: row.month,
        month: new Date(`${row.month}-01T00:00:00.000Z`).toLocaleDateString(
          "en-GB",
          { month: "short" },
        ),
        income: row.totalIncomeMinor / 100,
        expense: row.totalExpenseMinor / 100,
      })),
    [monthSeries],
  );

  const kpis: Kpi[] = useMemo(() => {
    const budgetUsagePct = budgets.length
      ? (budgets.reduce((sum, row) => sum + row.spent, 0) /
          budgets.reduce((sum, row) => sum + row.limit, 0)) *
        100
      : 0;
    return [
      {
        label: "Total Income",
        value: (monthSummary?.totalIncomeMinor ?? 0) / 100,
        delta: 0,
        spark: chartData.map((x) => x.income),
        tone: "success",
      },
      {
        label: "Total Expenses",
        value: (monthSummary?.totalExpenseMinor ?? 0) / 100,
        delta: 0,
        spark: chartData.map((x) => x.expense),
        tone: "danger",
      },
      {
        label: "Net Balance",
        value: (monthSummary?.netBalanceMinor ?? 0) / 100,
        delta: 0,
        spark: chartData.map((x) => x.income - x.expense),
        tone: (monthSummary?.netBalanceMinor ?? 0) >= 0 ? "success" : "danger",
      },
      {
        label: "Budget Usage",
        value: Math.round(budgetUsagePct),
        delta: 0,
        spark: [0, 20, 40, 60, 80, budgetUsagePct],
        tone:
          budgetUsagePct >= 100
            ? "danger"
            : budgetUsagePct >= 80
              ? "warning"
              : "neutral",
      },
    ];
  }, [budgets, chartData, monthSummary]);

  const thisMonthTransactions = useMemo(
    () => transactions.filter((row) => row.date.slice(0, 7) === monthId),
    [monthId, transactions],
  );

  const filteredForList = useMemo(
    () =>
      transactions.filter((row) => {
        if (filters.type !== "all" && row.type !== filters.type) return false;
        if (
          filters.categoryId !== "all" &&
          row.categoryId !== filters.categoryId
        )
          return false;
        return withinRange(row, filters.range, month);
      }),
    [transactions, filters, month],
  );

  const handleAdd = async (tx: Omit<Transaction, "id">) => {
    try {
      await createTransaction({
        amountMinor: Math.round(tx.amount * 100),
        type: tx.type,
        categoryId: tx.categoryId as never,
        date: new Date(tx.date).getTime(),
        note: tx.note,
        merchant: tx.note,
      });
      toast.success("Transaction added");
    } catch (createError) {
      toast.error(
        createError instanceof Error
          ? createError.message
          : "Failed to add transaction",
      );
    }
  };

  const handleDelete = async (transactionId: string) => {
    await removeTransaction({ transactionId: transactionId as never });
    toast("Transaction deleted");
  };

  const handleExport = async () => {
    const payload = await exportCsv({ month: monthId });
    const blob = new Blob([payload.csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", payload.filename);
    link.click();
  };

  const saveBudgetNotification = async () => {
    const over = budgets.find((budget) => budget.spent >= budget.limit);
    if (!over) {
      toast("No over-budget category for this month");
      return;
    }
    const category = categories.find((entry) => entry.id === over.categoryId);
    await createNotification({
      title: "Budget exceeded",
      message: `${category?.label ?? "Category"} exceeded the limit in ${monthId}`,
      type: "budget",
      month: monthId,
      categoryId: over.categoryId as never,
    });
    toast.success("Budget alert saved");
  };

  const scrollToAdd = () => {
    document
      .getElementById("add-transaction")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-dvh bg-background">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section
            aria-label="Summary"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <KpiCardSkeleton key={index} />
            ))}
          </section>
        </main>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-dvh bg-background">
        <main className="mx-auto flex min-h-dvh max-w-7xl items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              Sign in to Trackr
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your dashboard data is protected and only available after
              authentication.
            </p>
            <div className="mt-4">
              <SignInButton mode="modal">
                <Button>Sign in</Button>
              </SignInButton>
            </div>
          </div>
        </main>
      </div>
    );
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
        {error && (
          <div className="mb-6">
            <ErrorBanner description={error} onDismiss={() => setError(null)} />
          </div>
        )}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              {formatMonthYear(month)} · GHS
            </p>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              className="w-full sm:w-auto"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={saveBudgetNotification}
              className="w-full sm:w-auto"
            >
              Save budget alert
            </Button>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transactions tracked
            </p>
          </div>
        </div>

        <section
          aria-label="Summary"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <KpiCardSkeleton key={index} />
              ))
            : kpis.map((kpi) => (
                <KpiCard
                  key={kpi.label}
                  kpi={kpi}
                  asPercent={kpi.label === "Budget Usage"}
                />
              ))}
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {loading ? (
              <ChartSkeleton />
            ) : (
              <IncomeExpenseChart data={chartData} />
            )}
            {loading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <CategoryChart
                categories={categories}
                transactions={thisMonthTransactions}
                monthLabel={formatMonthYear(month)}
              />
            )}
            {loading ? (
              <TableSkeleton />
            ) : (
              <TransactionsList
                categories={categories}
                transactions={filteredForList}
                globalSearch={search}
                onDelete={handleDelete}
                onAddFirst={scrollToAdd}
              />
            )}
          </div>

          <aside className="flex flex-col gap-6">
            <div id="add-transaction" className="scroll-mt-24">
              {loading ? (
                <ChartSkeleton height="h-64" />
              ) : (
                <AddTransactionCard categories={categories} onAdd={handleAdd} />
              )}
            </div>
            {loading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <BudgetProgressCard categories={categories} budgets={budgets} />
            )}
            {loading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <QuickFiltersCard
                categories={categories}
                filters={filters}
                onChange={setFilters}
              />
            )}
          </aside>
        </div>

        <footer className="mt-10 border-t border-border pt-6 pb-2 text-center text-xs text-muted-foreground">
          Trackr · Built for Ghana
        </footer>
      </main>
    </div>
  );
}
