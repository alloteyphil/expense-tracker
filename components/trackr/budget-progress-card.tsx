"use client"

import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatGHS } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Category, CategoryBudget } from "@/lib/types"

interface BudgetProgressCardProps {
  categories: Category[]
  budgets: CategoryBudget[]
}

function tone(percent: number): "normal" | "warning" | "danger" {
  if (percent >= 100) return "danger"
  if (percent >= 80) return "warning"
  return "normal"
}

const toneBar: Record<"normal" | "warning" | "danger", string> = {
  normal: "bg-primary",
  warning: "bg-warning",
  danger: "bg-destructive",
}

const toneLabel: Record<"normal" | "warning" | "danger", string> = {
  normal: "text-muted-foreground",
  warning: "text-warning-foreground",
  danger: "text-destructive",
}

export function BudgetProgressCard({ categories, budgets }: BudgetProgressCardProps) {
  const categoryMap = Object.fromEntries(categories.map((category) => [category.id, category]))
  const anyOver = budgets.some((b) => b.spent >= b.limit)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg">Budget progress</CardTitle>
            <CardDescription>This month&apos;s category limits</CardDescription>
          </div>
          {anyOver && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive"
              role="status"
            >
              <AlertTriangle className="size-3" aria-hidden="true" />
              Over limit
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {budgets.map((b) => {
            const cat = categoryMap[b.categoryId]
            const pct = Math.min(999, Math.round((b.spent / b.limit) * 100))
            const clamped = Math.min(100, pct)
            const t = tone(pct)
            return (
              <li key={b.categoryId} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0" aria-hidden="true">
                      {cat?.glyph}
                    </span>
                    <span className="truncate font-medium">{cat?.label}</span>
                  </div>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatGHS(b.spent, { compact: true })} / {formatGHS(b.limit, { compact: true })}
                  </span>
                </div>
                <div
                  className="relative h-2 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={clamped}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${cat?.label} budget used`}
                >
                  <div
                    className={cn("h-full rounded-full transition-[width]", toneBar[t])}
                    style={{ width: `${clamped}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(toneLabel[t])}>
                    {t === "danger" ? "Over budget" : t === "warning" ? "Close to limit" : "On track"}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{pct}%</span>
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
