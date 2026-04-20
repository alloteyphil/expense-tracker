"use client";

import { useRouter } from "next/navigation";
import { CategoryChart } from "@/components/trackr/category-chart";
import { Header } from "@/components/trackr/header";
import { IncomeExpenseChart } from "@/components/trackr/income-expense-chart";
import { ChartSkeleton } from "@/components/trackr/skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrackrData } from "@/hooks/use-trackr-data";
import { formatGHS, formatMonthYear } from "@/lib/format";

export default function AnalyticsPage() {
  const data = useTrackrData();
  const router = useRouter();

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
        {data.loading ? <ChartSkeleton /> : <IncomeExpenseChart data={data.chartData} />}
        {data.loading ? (
          <ChartSkeleton height="h-56" />
        ) : (
          <CategoryChart
            categories={data.categories}
            transactions={data.thisMonthTransactions}
            monthLabel={formatMonthYear(data.month)}
          />
        )}
        <Card>
          <CardHeader>
            <CardTitle>Recurring schedule preview</CardTitle>
            <CardDescription>Upcoming recurring entries tracked in Convex.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recurringPreview.length === 0 && (
              <p className="text-sm text-muted-foreground">No recurring transactions configured yet.</p>
            )}
            {data.recurringPreview.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.note || "Recurring transaction"}</p>
                  <p className="text-sm text-muted-foreground">
                    Next run: {item.nextRunDate} · {item.interval}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.type === "income" ? "default" : "secondary"}>{item.type}</Badge>
                  <span className="font-semibold">{formatGHS(item.amount)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Financial health score</CardTitle>
            <CardDescription>Composite score with transparent subscore weighting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              Score: {data.healthScore?.score ?? 0}/100
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <p className="text-sm text-muted-foreground">
                Savings rate: {data.healthScore?.subscores.savingsRate ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Budget adherence: {data.healthScore?.subscores.budgetAdherence ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Recurring burden: {data.healthScore?.subscores.recurringBurden ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">
                Spending stability: {data.healthScore?.subscores.spendingStability ?? 0}
              </p>
            </div>
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              {(data.healthScore?.reasons ?? []).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
