"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatGHS } from "@/lib/format"
import type { MonthlyTotals } from "@/lib/types"

interface IncomeExpenseChartProps {
  data: MonthlyTotals[]
}

const chartConfig: ChartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expense: {
    label: "Expenses",
    color: "var(--chart-4)",
  },
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Income vs Expenses</CardTitle>
        <CardDescription>Last 6 months, in GHS</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(v) => formatGHS(Number(v), { compact: true }).replace("GH₵", "")}
              width={48}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex min-w-24 items-center justify-between gap-3">
                      <span className="capitalize text-muted-foreground">{String(name)}</span>
                      <span className="font-medium tabular-nums">
                        {formatGHS(Number(value), { compact: true })}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ChartContainer>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: "var(--chart-1)" }} aria-hidden="true" />
            <span className="text-muted-foreground">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: "var(--chart-4)" }} aria-hidden="true" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
