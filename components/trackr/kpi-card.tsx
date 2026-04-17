"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDelta, formatGHS } from "@/lib/format"
import type { Kpi } from "@/lib/types"

interface KpiCardProps {
  kpi: Kpi
  /** When true, formats value as a percentage instead of GHS currency. */
  asPercent?: boolean
}

const toneStyles: Record<Kpi["tone"], { pill: string; stroke: string; fill: string }> = {
  neutral: {
    pill: "bg-muted text-muted-foreground",
    stroke: "var(--muted-foreground)",
    fill: "var(--muted-foreground)",
  },
  success: {
    pill: "bg-primary/10 text-primary",
    stroke: "var(--primary)",
    fill: "var(--primary)",
  },
  danger: {
    pill: "bg-destructive/10 text-destructive",
    stroke: "var(--destructive)",
    fill: "var(--destructive)",
  },
  warning: {
    pill: "bg-warning/20 text-warning-foreground",
    stroke: "var(--warning)",
    fill: "var(--warning)",
  },
}

export function KpiCard({ kpi, asPercent = false }: KpiCardProps) {
  const tone = toneStyles[kpi.tone]
  const positive = kpi.delta >= 0
  const data = kpi.spark.map((v, i) => ({ i, v }))
  const gradientId = `spark-${kpi.label.replace(/\s+/g, "-").toLowerCase()}`

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 truncate text-2xl font-semibold tabular-nums sm:text-3xl">
              {asPercent ? `${kpi.value.toFixed(0)}%` : formatGHS(kpi.value, { compact: true })}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              tone.pill,
            )}
            aria-label={`Change ${formatDelta(kpi.delta)}`}
          >
            {positive ? (
              <ArrowUpRight className="size-3" aria-hidden="true" />
            ) : (
              <ArrowDownRight className="size-3" aria-hidden="true" />
            )}
            {formatDelta(kpi.delta)}
          </span>
        </div>

        <div className="mt-4 h-12 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={tone.fill} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={tone.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={tone.stroke}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
