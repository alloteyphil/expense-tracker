"use client"

import { Cell, Pie, PieChart } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { formatGHS } from "@/lib/format"
import { CATEGORY_MAP } from "@/lib/mock-data"
import type { CategoryId, Transaction } from "@/lib/types"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { PieChart as PieIcon } from "lucide-react"

interface CategoryChartProps {
  transactions: Transaction[]
  monthLabel: string
}

export function CategoryChart({ transactions, monthLabel }: CategoryChartProps) {
  const expenses = transactions.filter((t) => t.type === "expense")

  const byCat = new Map<CategoryId, number>()
  for (const t of expenses) {
    byCat.set(t.categoryId, (byCat.get(t.categoryId) || 0) + t.amount)
  }

  const data = Array.from(byCat.entries())
    .map(([id, value]) => ({
      id,
      name: CATEGORY_MAP[id]?.label ?? id,
      value,
      color: CATEGORY_MAP[id]?.color ?? "var(--chart-5)",
    }))
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((s, d) => s + d.value, 0)

  const chartConfig = data.reduce((acc, d) => {
    acc[d.id] = { label: d.name, color: d.color }
    return acc
  }, {} as ChartConfig)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Category Breakdown</CardTitle>
        <CardDescription>Expenses for {monthLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <Empty className="border-0 py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PieIcon />
              </EmptyMedia>
              <EmptyTitle>No expenses yet</EmptyTitle>
              <EmptyDescription>Add an expense to see your category breakdown.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr] sm:items-center">
            <div className="relative mx-auto h-56 w-56">
              <ChartContainer config={chartConfig} className="aspect-square h-56 w-56">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex min-w-28 items-center justify-between gap-3">
                            <span className="text-muted-foreground">{String(name)}</span>
                            <span className="font-medium tabular-nums">
                              {formatGHS(Number(value), { compact: true })}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={2}
                    stroke="var(--card)"
                  >
                    {data.map((d) => (
                      <Cell key={d.id} fill={d.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatGHS(total, { compact: true })}
                </span>
              </div>
            </div>

            {/* Legend */}
            <ul className="flex flex-col gap-2">
              {data.map((d) => {
                const pct = total > 0 ? (d.value / total) * 100 : 0
                return (
                  <li key={d.id} className="flex items-center gap-3 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-sm"
                      style={{ background: d.color }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 truncate">{d.name}</span>
                    <span className="tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>
                    <span className="w-20 text-right font-medium tabular-nums">
                      {formatGHS(d.value, { compact: true })}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
