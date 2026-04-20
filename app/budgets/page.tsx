"use client";

import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp } from "lucide-react";
import { BudgetProgressCard } from "@/components/trackr/budget-progress-card";
import { Header } from "@/components/trackr/header";
import { ChartSkeleton } from "@/components/trackr/skeletons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrackrData } from "@/hooks/use-trackr-data";
import { formatGHS } from "@/lib/format";

export default function BudgetsPage() {
  const data = useTrackrData();
  const router = useRouter();
  const trendUp = data.budgetVariance.spentDelta > 0;

  return (
    <div className="min-h-dvh bg-background">
      <Header
        month={data.month}
        onMonthChange={data.setMonth}
        search={data.search}
        onSearchChange={data.setSearch}
        onAddTransaction={() => router.push("/transactions#add-transaction")}
      />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget variance trend</CardTitle>
            <CardDescription>Compare this month against previous month totals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Spend delta</p>
              <p className="mt-1 text-xl font-semibold">
                {trendUp ? "+" : ""}
                {formatGHS(data.budgetVariance.spentDelta)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Limit delta</p>
              <p className="mt-1 text-xl font-semibold">
                {data.budgetVariance.limitDelta > 0 ? "+" : ""}
                {formatGHS(data.budgetVariance.limitDelta)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Spend trend</p>
              <p className="mt-1 flex items-center gap-2 text-xl font-semibold">
                {trendUp ? <TrendingUp className="size-5 text-destructive" /> : <TrendingDown className="size-5 text-primary" />}
                {Math.abs(data.budgetVariance.spentPctDelta).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        {data.loading ? (
          <ChartSkeleton height="h-64" />
        ) : (
          <BudgetProgressCard categories={data.categories} budgets={data.budgets} />
        )}
      </main>
    </div>
  );
}
