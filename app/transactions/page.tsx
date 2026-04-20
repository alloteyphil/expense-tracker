"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AddTransactionCard } from "@/components/trackr/add-transaction-card";
import { Header } from "@/components/trackr/header";
import { QuickFiltersCard } from "@/components/trackr/quick-filters-card";
import { ChartSkeleton, TableSkeleton } from "@/components/trackr/skeletons";
import { TransactionsList } from "@/components/trackr/transactions-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrackrData } from "@/hooks/use-trackr-data";

const PRESET_STORAGE_KEY = "trackr.transactionFilterPresets";

export default function TransactionsPage() {
  const data = useTrackrData();
  const searchParams = useSearchParams();
  const [selectedPreset, setSelectedPreset] = useState("default");
  const [presets, setPresets] = useState<Record<string, typeof data.filters>>(() => {
    if (typeof window === "undefined") return {};
    const raw = window.localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, typeof data.filters>;
    } catch {
      return {};
    }
  });

  const presetEntries = useMemo(
    () => Object.entries(presets).sort(([a], [b]) => a.localeCompare(b)),
    [presets],
  );

  const initialDraft = useMemo(() => {
    const amount = searchParams.get("amount");
    const date = searchParams.get("date");
    const merchant = searchParams.get("merchant");
    return {
      amount: amount ? Number(amount) : undefined,
      date: date ?? undefined,
      note: merchant ?? undefined,
    };
  }, [searchParams]);

  const saveCurrentPreset = () => {
    const key = window.prompt("Preset name");
    if (!key) return;
    const next = { ...presets, [key]: data.filters };
    setPresets(next);
    setSelectedPreset(key);
    window.localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(next));
  };

  const loadPreset = (key: string) => {
    setSelectedPreset(key);
    const preset = presets[key];
    if (preset) {
      data.setFilters(preset);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header
        month={data.month}
        onMonthChange={data.setMonth}
        search={data.search}
        onSearchChange={data.setSearch}
        onAddTransaction={() =>
          document.getElementById("add-transaction")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Saved filter presets</CardTitle>
                  <CardDescription>Save and reuse transaction filter combinations.</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={saveCurrentPreset}>
                  <Save className="size-4" />
                  Save current filters
                </Button>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {presetEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No presets yet. Save your first one.</p>
                )}
                {presetEntries.map(([name]) => (
                  <Button
                    key={name}
                    size="sm"
                    variant={name === selectedPreset ? "secondary" : "outline"}
                    onClick={() => loadPreset(name)}
                  >
                    {name}
                  </Button>
                ))}
              </CardContent>
            </Card>
            {data.loading ? (
              <TableSkeleton />
            ) : (
              <TransactionsList
                categories={data.categories}
                transactions={data.filteredForList}
                globalSearch={data.search}
                onDelete={data.handleDelete}
                onAddFirst={() =>
                  document.getElementById("add-transaction")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              />
            )}
          </div>
          <aside className="space-y-6">
            {data.loading ? (
              <ChartSkeleton height="h-48" />
            ) : (
              <QuickFiltersCard categories={data.categories} filters={data.filters} onChange={data.setFilters} />
            )}
            <div id="add-transaction">
              {data.loading ? (
                <ChartSkeleton height="h-64" />
              ) : (
                <AddTransactionCard
                  key={`${initialDraft.amount ?? ""}-${initialDraft.date ?? ""}-${initialDraft.note ?? ""}`}
                  categories={data.categories}
                  onAdd={data.handleAdd}
                  initialDraft={initialDraft}
                />
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
