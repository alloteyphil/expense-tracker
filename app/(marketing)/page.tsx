import Link from "next/link";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const previewMetrics = [
  { label: "Income this month", value: "GHS 8,420.00" },
  { label: "Expenses this month", value: "GHS 5,365.50" },
  { label: "Net balance", value: "GHS 3,054.50" },
];

const highlights = [
  "Real-time dashboard updates",
  "Smart transaction categories",
  "Monthly budget progress tracking",
  "Export-ready analytics summaries",
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-3 inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Built for fast personal finance tracking
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            See where your money goes before month end.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Trackr gives you a clear picture of spending, budgets, and trends with a live dashboard.
            Create an account to save transactions and sync your data securely.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <Button>
                  Get started
                  <ArrowRight className="size-4" />
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline">Sign in</Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Button asChild>
                <Link href="/dashboard">
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Show>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
            <CardDescription>Sample insights shown before sign-in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {previewMetrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-semibold">{metric.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {highlights.map((item) => (
          <div key={item} className="rounded-xl border border-border bg-card p-4">
            <p className="inline-flex items-center gap-2 text-sm">
              <Wallet className="size-4 text-primary" />
              {item}
            </p>
          </div>
        ))}
      </section>

    </main>
  );
}
