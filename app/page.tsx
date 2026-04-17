"use client";

import { useEffect, useMemo, useState } from "react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Home() {
  const { isSignedIn } = useAuth();
  const storeUser = useMutation(api.users.store);
  const addExpense = useMutation(api.expenses.create);
  const removeExpense = useMutation(api.expenses.remove);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    void storeUser({});
  }, [isSignedIn, storeUser]);

  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const rangeStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const rangeEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      rangeStart: rangeStartDate.getTime(),
      rangeEnd: rangeEndDate.getTime(),
    };
  }, []);

  const expenses = useQuery(api.expenses.listRecent, isSignedIn ? { limit: 10 } : "skip");
  const summary = useQuery(
    api.analytics.monthlySummary,
    isSignedIn ? { rangeStart, rangeEnd } : "skip",
  );

  async function handleSubmit(formData: FormData) {
    const amount = Number(formData.get("amount"));
    const spentAtValue = formData.get("spentAt");
    const noteValue = formData.get("note");

    if (!Number.isFinite(amount) || amount <= 0 || typeof spentAtValue !== "string") {
      return;
    }

    setIsSaving(true);
    try {
      await addExpense({
        amount,
        currency: "USD",
        spentAt: new Date(spentAtValue).getTime(),
        note: typeof noteValue === "string" && noteValue.trim().length > 0 ? noteValue.trim() : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <h1 className="text-xl font-semibold tracking-tight">Expense Tracker Dashboard</h1>
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
            <SignInButton mode="modal" />
            <SignUpButton mode="modal" />
            </>
          ) : (
            <UserButton />
          )}
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl gap-6 px-6 pb-10">
        {!isSignedIn ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-8">
            <h2 className="text-2xl font-semibold">Track every expense with live analytics</h2>
            <p className="mt-2 max-w-xl text-zinc-600">
              Sign in to add expenses, monitor monthly spend, and review recent transactions.
            </p>
          </section>
        ) : (
          <>
          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Total This Month</p>
              <p className="mt-2 text-2xl font-semibold">
                {summary ? formatCurrency(summary.totalSpend) : "Loading..."}
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Transactions</p>
              <p className="mt-2 text-2xl font-semibold">
                {summary ? summary.totalTransactions : "Loading..."}
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-sm text-zinc-500">Avg. Transaction</p>
              <p className="mt-2 text-2xl font-semibold">
                {summary ? formatCurrency(summary.averageSpend) : "Loading..."}
              </p>
            </article>
          </section>

          <section className="grid gap-4 md:grid-cols-[2fr_3fr]">
            <article className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Add Expense</h2>
              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  void handleSubmit(formData).then(() => {
                    event.currentTarget.reset();
                  });
                }}
              >
                <input
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount (USD)"
                  required
                />
                <input
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                  name="spentAt"
                  type="date"
                  required
                />
                <input
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2"
                  name="note"
                  type="text"
                  placeholder="Note (optional)"
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full rounded-lg bg-zinc-900 px-3 py-2 font-medium text-white disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Expense"}
                </button>
              </form>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Recent Expenses</h2>
              <div className="mt-4 space-y-3">
                {expenses && expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <div
                      key={expense._id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{formatCurrency(expense.amount)}</p>
                        <p className="text-sm text-zinc-500">
                          {new Date(expense.spentAt).toLocaleDateString()}
                          {expense.note ? ` - ${expense.note}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-sm font-medium text-red-600"
                        onClick={() => void removeExpense({ expenseId: expense._id })}
                      >
                        Delete
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No expenses yet. Add your first one.</p>
                )}
              </div>
            </article>
          </section>
          </>
        )}
      </main>
    </div>
  );
}
