"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { monthKey, toDateString, withinRange } from "@/lib/trackr";
import type {
  Category,
  CategoryBudget,
  Kpi,
  MonthlyTotals,
  QuickFilters,
  Transaction,
} from "@/lib/types";

export type RecurringPreviewItem = {
  id: string;
  note?: string;
  amount: number;
  type: "income" | "expense";
  interval: "weekly" | "monthly";
  nextRunDate: string;
};

export function useTrackrData() {
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
  const previousMonthRaw = useQuery(
    api.budgets.listByMonth,
    canQuery
      ? {
          month: monthKey(
            new Date(month.getFullYear(), month.getMonth() - 1, 1),
          ),
        }
      : "skip",
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
          initError instanceof Error ? initError.message : "Initialization failed",
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

  const recurringPreview: RecurringPreviewItem[] = useMemo(
    () =>
      (listResponse?.page ?? [])
        .filter((row) => row.isRecurring && row.recurringInterval && row.nextRecurringAt)
        .map((row) => ({
          id: row._id,
          note: row.note,
          amount: row.amountMinor / 100,
          type: row.type,
          interval: row.recurringInterval as "weekly" | "monthly",
          nextRunDate: toDateString(row.nextRecurringAt ?? row.date),
        }))
        .sort((a, b) => a.nextRunDate.localeCompare(b.nextRunDate)),
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

  const previousBudgets: CategoryBudget[] = useMemo(
    () =>
      (previousMonthRaw ?? []).map((row) => ({
        categoryId: row.categoryId,
        limit: row.limitMinor / 100,
        spent: row.spentMinor / 100,
      })),
    [previousMonthRaw],
  );

  const budgetVariance = useMemo(() => {
    const currentSpent = budgets.reduce((sum, row) => sum + row.spent, 0);
    const previousSpent = previousBudgets.reduce((sum, row) => sum + row.spent, 0);
    const currentLimit = budgets.reduce((sum, row) => sum + row.limit, 0);
    const previousLimit = previousBudgets.reduce((sum, row) => sum + row.limit, 0);
    return {
      spentDelta: currentSpent - previousSpent,
      limitDelta: currentLimit - previousLimit,
      spentPctDelta:
        previousSpent > 0 ? ((currentSpent - previousSpent) / previousSpent) * 100 : 0,
    };
  }, [budgets, previousBudgets]);

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
        if (filters.categoryId !== "all" && row.categoryId !== filters.categoryId) {
          return false;
        }
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
        createError instanceof Error ? createError.message : "Failed to add transaction",
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

  return {
    isLoaded,
    isSignedIn,
    month,
    setMonth,
    monthId,
    search,
    setSearch,
    filters,
    setFilters,
    error,
    setError,
    loading,
    categories,
    transactions,
    filteredForList,
    thisMonthTransactions,
    budgets,
    budgetVariance,
    recurringPreview,
    chartData,
    kpis,
    handleAdd,
    handleDelete,
    handleExport,
    saveBudgetNotification,
  };
}
