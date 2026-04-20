"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/trackr/header";
import { ChartSkeleton } from "@/components/trackr/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTrackrData } from "@/hooks/use-trackr-data";
import { formatGHS } from "@/lib/format";
import { api } from "@/convex/_generated/api";

export default function GoalsPage() {
  const data = useTrackrData();
  const router = useRouter();
  const createGoal = useMutation(api.goals.create);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  const onCreate = async () => {
    const amount = Number(targetAmount);
    if (!name.trim() || Number.isNaN(amount) || amount <= 0) return;
    setSaving(true);
    try {
      await createGoal({
        name: name.trim(),
        targetAmountMinor: Math.round(amount * 100),
        targetDate: targetDate || undefined,
      });
      setName("");
      setTargetAmount("");
      setTargetDate("");
    } finally {
      setSaving(false);
    }
  };

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
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground">Plan savings targets and track progress.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create goal</CardTitle>
            <CardDescription>Set a target amount and optional deadline.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="goal-name">Name</Label>
              <Input id="goal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Emergency fund" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target">Target amount</Label>
              <Input
                id="goal-target"
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="15000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-date">Target date</Label>
              <Input id="goal-date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
            </div>
            <div className="md:col-span-4">
              <Button onClick={onCreate} disabled={saving}>
                {saving ? "Saving..." : "Create goal"}
              </Button>
            </div>
          </CardContent>
        </Card>
        {data.loading ? (
          <ChartSkeleton height="h-64" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.goals.length === 0 && (
              <Card>
                <CardContent className="py-10 text-sm text-muted-foreground">No active goals yet.</CardContent>
              </Card>
            )}
            {data.goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  <CardDescription>
                    {formatGHS(goal.currentAmount)} of {formatGHS(goal.targetAmount)}
                    {goal.targetDate ? ` · due ${goal.targetDate}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${goal.progressPct}%` }} />
                  </div>
                  <p className="text-sm text-muted-foreground">{goal.progressPct}% complete</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
