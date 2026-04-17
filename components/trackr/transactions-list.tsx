"use client"

import { useMemo, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Filter, MoreHorizontal, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { formatDateShort, formatGHS } from "@/lib/format"
import { CATEGORIES, CATEGORY_MAP } from "@/lib/mock-data"
import type { Transaction, TransactionType } from "@/lib/types"

const PAGE_SIZE = 8

interface TransactionsListProps {
  transactions: Transaction[]
  /** Global search query (from header). */
  globalSearch?: string
  onDelete: (id: string) => void
  onAddFirst?: () => void
}

export function TransactionsList({
  transactions,
  globalSearch = "",
  onDelete,
  onAddFirst,
}: TransactionsListProps) {
  const [localSearch, setLocalSearch] = useState("")
  const [type, setType] = useState<TransactionType | "all">("all")
  const [category, setCategory] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null)

  const query = (globalSearch || localSearch).trim().toLowerCase()

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false
      if (category !== "all" && t.categoryId !== category) return false
      if (query) {
        const cat = CATEGORY_MAP[t.categoryId]?.label.toLowerCase() ?? ""
        const hay = `${t.note ?? ""} ${cat} ${t.amount}`.toLowerCase()
        if (!hay.includes(query)) return false
      }
      return true
    })
  }, [transactions, type, category, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <>
      <Card>
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">Transactions</CardTitle>
              <CardDescription>
                {filtered.length} {filtered.length === 1 ? "item" : "items"}
                {query ? ` matching “${query}”` : ""}
              </CardDescription>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Filter className="size-4" aria-hidden="true" />
              <span className="text-sm">Filter</span>
            </div>
            <Select value={type} onValueChange={(v) => { setType(v as TransactionType | "all"); setPage(1) }}>
              <SelectTrigger size="sm" className="w-32" aria-label="Filter by type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
              <SelectTrigger size="sm" className="w-44" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="search"
              value={localSearch}
              onChange={(e) => { setLocalSearch(e.target.value); setPage(1) }}
              placeholder="Search notes…"
              className="h-8 flex-1 min-w-40 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label="Search transaction notes"
            />
          </div>
        </CardHeader>

        <CardContent className="px-0">
          {filtered.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ArrowUpRight />
                </EmptyMedia>
                <EmptyTitle>No transactions found</EmptyTitle>
                <EmptyDescription>
                  {transactions.length === 0
                    ? "Start by recording your first income or expense."
                    : "Try adjusting your filters or search terms."}
                </EmptyDescription>
              </EmptyHeader>
              {transactions.length === 0 && onAddFirst && (
                <EmptyContent>
                  <Button onClick={onAddFirst}>Add transaction</Button>
                </EmptyContent>
              )}
            </Empty>
          ) : (
            <>
              {/* Table view (sm+) */}
              <div className="hidden overflow-x-auto sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-28">Date</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((t) => {
                      const cat = CATEGORY_MAP[t.categoryId]
                      const isIncome = t.type === "income"
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {formatDateShort(t.date)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1 font-normal",
                                isIncome
                                  ? "border-primary/20 bg-primary/10 text-primary"
                                  : "border-destructive/20 bg-destructive/10 text-destructive",
                              )}
                            >
                              {isIncome ? (
                                <ArrowUpRight className="size-3" aria-hidden="true" />
                              ) : (
                                <ArrowDownLeft className="size-3" aria-hidden="true" />
                              )}
                              {isIncome ? "Income" : "Expense"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span
                                aria-hidden="true"
                                className="flex size-6 items-center justify-center rounded-md bg-muted text-xs"
                              >
                                {cat?.glyph ?? "•"}
                              </span>
                              <span className="font-medium">{cat?.label ?? t.categoryId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[240px] truncate text-muted-foreground">
                            {t.note || <span className="italic">—</span>}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right font-medium tabular-nums",
                              isIncome ? "text-primary" : "text-foreground",
                            )}
                          >
                            {isIncome ? "+" : "−"}
                            {formatGHS(t.amount).replace("-", "")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => setPendingDelete(t)}>
                                  <Trash2 className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Card list view (<sm) */}
              <ul className="divide-y divide-border sm:hidden">
                {pageItems.map((t) => {
                  const cat = CATEGORY_MAP[t.categoryId]
                  const isIncome = t.type === "income"
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                      <span
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-base"
                      >
                        {cat?.glyph ?? "•"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{cat?.label ?? t.categoryId}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {formatDateShort(t.date)}
                          {t.note ? ` · ${t.note}` : ""}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "text-right text-sm font-semibold tabular-nums",
                          isIncome ? "text-primary" : "text-foreground",
                        )}
                      >
                        {isIncome ? "+" : "−"}
                        {formatGHS(t.amount).replace("-", "")}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8" aria-label="Row actions">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => setPendingDelete(t)}>
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  )
                })}
              </ul>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border px-4 py-3 sm:px-6">
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {pageCount}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="size-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    disabled={currentPage >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <DeleteTransactionDialog
        transaction={pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) onDelete(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </>
  )
}

/* ------- Local delete dialog (kept co-located for clarity) ------- */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function DeleteTransactionDialog({
  transaction,
  onOpenChange,
  onConfirm,
}: {
  transaction: Transaction | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const cat = transaction ? CATEGORY_MAP[transaction.categoryId] : null
  return (
    <AlertDialog open={!!transaction} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            {transaction ? (
              <>
                This will permanently remove the{" "}
                <span className="font-medium text-foreground">
                  {formatGHS(transaction.amount)}
                </span>{" "}
                {transaction.type} in{" "}
                <span className="font-medium text-foreground">{cat?.label}</span>. This action
                cannot be undone.
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
