"use client";

import { SignInButton } from "@clerk/nextjs";
import { AddTransactionCard } from "@/components/trackr/add-transaction-card";
import { BudgetProgressCard } from "@/components/trackr/budget-progress-card";
import { CategoryChart } from "@/components/trackr/category-chart";
import { ErrorBanner } from "@/components/trackr/error-banner";
import { Header } from "@/components/trackr/header";
import { IncomeExpenseChart } from "@/components/trackr/income-expense-chart";
import { KpiCard } from "@/components/trackr/kpi-card";
import { QuickFiltersCard } from "@/components/trackr/quick-filters-card";
import { ChartSkeleton, KpiCardSkeleton, TableSkeleton } from "@/components/trackr/skeletons";
import { TransactionsList } from "@/components/trackr/transactions-list";
import { Button } from "@/components/ui/button";
import { useTrackrData } from "@/hooks/use-trackr-data";
import { formatMonthYear } from "@/lib/format";

export default function DashboardPage() {
  const data = useTrackrData();

  const scrollToAdd = () => {
    document.getElementById("add-transaction")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!data.isLoaded) {
    return (
      <div className="min-h-dvh bg-background">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <KpiCardSkeleton key={index} />
            ))}
          </section>
        </main>
      </div>
    );
  }

  if (!data.isSignedIn) {
    return (
      <div className="min-h-dvh bg-background">
        <main className="mx-auto flex min-h-dvh max-w-7xl items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="max-w-md rounded-xl border border-border bg-card p-6 text-center">
            <h1 className="text-xl font-semibold tracking-tight">Sign in to Trackr</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your dashboard data is protected and only available after authentication.
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
        month={data.month}
        onMonthChange={data.setMonth}
        search={data.search}
        onSearchChange={data.setSearch}
        onAddTransaction={scrollToAdd}
      />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {data.error && (
          <div className="mb-6">
            <ErrorBanner description={data.error} onDismiss={() => data.setError(null)} />
          </div>
        )}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Overview</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {data.currentUserName ?? "there"} · {formatMonthYear(data.month)} · GHS
            </p>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button size="sm" variant="outline" onClick={data.handleExport} className="w-full sm:w-auto">
              Export CSV
            </Button>
            <Button size="sm" variant="ghost" onClick={data.saveBudgetNotification} className="w-full sm:w-auto">
              Save budget alert
            </Button>
            <p className="text-xs text-muted-foreground">
              {data.monthTransactionCount} transactions this month
            </p>
          </div>
        </div>
        {data.topGoal && (
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Top goal: {data.topGoal.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.topGoal.progressPct}% complete · {data.topGoal.currentAmount.toFixed(2)} / {data.topGoal.targetAmount.toFixed(2)}
            </p>
          </div>
        )}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.loading
            ? Array.from({ length: 4 }).map((_, index) => <KpiCardSkeleton key={index} />)
            : data.kpis.map((kpi) => (
                <KpiCard key={kpi.label} kpi={kpi} asPercent={kpi.label === "Budget Usage"} />
              ))}
        </section>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {data.loading ? <ChartSkeleton /> : <IncomeExpenseChart data={data.chartData} />}
            {data.loading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <CategoryChart
                categories={data.categories}
                breakdown={data.categoryBreakdown}
                monthLabel={formatMonthYear(data.month)}
              />
            )}
            {data.loading ? (
              <TableSkeleton />
            ) : (
              <TransactionsList
                categories={data.categories}
                transactions={data.filteredForList}
                globalSearch={data.search}
                onDelete={data.handleDelete}
                onAddFirst={scrollToAdd}
              />
            )}
          </div>
          <aside className="flex flex-col gap-6">
            <div id="add-transaction" className="scroll-mt-24">
              {data.loading ? (
                <ChartSkeleton height="h-64" />
              ) : (
                <AddTransactionCard categories={data.categories} onAdd={data.handleAdd} />
              )}
            </div>
            {data.loading ? (
              <ChartSkeleton height="h-56" />
            ) : (
              <BudgetProgressCard categories={data.categories} budgets={data.budgets} />
            )}
            {data.loading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <QuickFiltersCard categories={data.categories} filters={data.filters} onChange={data.setFilters} />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
