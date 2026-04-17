"use client"

import { useId, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CATEGORIES } from "@/lib/mock-data"
import type { CategoryId, Transaction, TransactionType } from "@/lib/types"

interface AddTransactionCardProps {
  onAdd: (tx: Omit<Transaction, "id">) => void
}

export function AddTransactionCard({ onAdd }: AddTransactionCardProps) {
  const [type, setType] = useState<TransactionType>("expense")
  const [amount, setAmount] = useState<string>("")
  const [categoryId, setCategoryId] = useState<CategoryId>("food")
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [justAdded, setJustAdded] = useState(false)

  const amountId = useId()
  const dateId = useId()
  const noteId = useId()

  const applicable = useMemo(
    () => CATEGORIES.filter((c) => c.applicableTo.includes(type)),
    [type],
  )

  // When switching type, reset category if current one isn't applicable
  const handleTypeChange = (v: string) => {
    if (!v) return
    const next = v as TransactionType
    setType(next)
    const stillApplies = CATEGORIES.find((c) => c.id === categoryId)?.applicableTo.includes(next)
    if (!stillApplies) {
      const first = CATEGORIES.find((c) => c.applicableTo.includes(next))
      if (first) setCategoryId(first.id)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = Number(amount)
    if (!amount || Number.isNaN(n) || n <= 0) {
      setError("Enter an amount greater than 0.")
      return
    }
    if (!date) {
      setError("Pick a date.")
      return
    }
    setError(null)
    onAdd({
      type,
      amount: Math.round(n * 100) / 100,
      categoryId,
      date,
      note: note.trim() || undefined,
    })
    setAmount("")
    setNote("")
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Add transaction</CardTitle>
        <CardDescription>Record income or an expense quickly.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel asChild>
                <span>Type</span>
              </FieldLabel>
              <ToggleGroup
                type="single"
                value={type}
                onValueChange={handleTypeChange}
                variant="outline"
                className="grid w-full grid-cols-2"
                aria-label="Transaction type"
              >
                <ToggleGroupItem value="expense">Expense</ToggleGroupItem>
                <ToggleGroupItem value="income">Income</ToggleGroupItem>
              </ToggleGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor={amountId}>Amount</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon>
                    <span className="text-sm font-medium text-muted-foreground">GH₵</span>
                  </InputGroupAddon>
                  <InputGroupInput
                    id={amountId}
                    inputMode="decimal"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </InputGroup>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor={`cat-${amountId}`}>Category</FieldLabel>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v as CategoryId)}>
                <SelectTrigger id={`cat-${amountId}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {applicable.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="mr-2" aria-hidden="true">
                        {c.glyph}
                      </span>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor={dateId}>Date</FieldLabel>
              <Input
                id={dateId}
                type="date"
                value={date}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={noteId}>Note (optional)</FieldLabel>
              <Textarea
                id={noteId}
                rows={2}
                placeholder="e.g. Waakye at Osu"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </Field>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              {justAdded ? "Added ✓" : "Add transaction"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
