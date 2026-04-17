"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import { CATEGORIES } from "@/lib/mock-data"
import type { CategoryId, DateRangeId, QuickFilters, TransactionType } from "@/lib/types"

interface QuickFiltersCardProps {
  filters: QuickFilters
  onChange: (f: QuickFilters) => void
}

const RANGES: { id: DateRangeId; label: string }[] = [
  { id: "this-month", label: "This month" },
  { id: "last-month", label: "Last month" },
  { id: "3-months", label: "3 months" },
  { id: "all", label: "All" },
]

export function QuickFiltersCard({ filters, onChange }: QuickFiltersCardProps) {
  const reset = () =>
    onChange({ type: "all", categoryId: "all", range: "this-month" })

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base sm:text-lg">Quick filters</CardTitle>
          <CardDescription>Refine what you see on this dashboard.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={reset}>
          Reset
        </Button>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel>Type</FieldLabel>
            <ToggleGroup
              type="single"
              variant="outline"
              value={filters.type}
              onValueChange={(v) => v && onChange({ ...filters, type: v as TransactionType | "all" })}
              className="grid grid-cols-3"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="income">Income</ToggleGroupItem>
              <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
            </ToggleGroup>
          </Field>

          <Field>
            <FieldLabel htmlFor="quick-category">Category</FieldLabel>
            <Select
              value={filters.categoryId}
              onValueChange={(v) => onChange({ ...filters, categoryId: v as CategoryId | "all" })}
            >
              <SelectTrigger id="quick-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="mr-2" aria-hidden="true">{c.glyph}</span>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Date range</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {RANGES.map((r) => {
                const active = filters.range === r.id
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onChange({ ...filters, range: r.id })}
                    className={
                      "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 " +
                      (active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent")
                    }
                    aria-pressed={active}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
