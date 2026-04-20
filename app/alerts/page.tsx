"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/trackr/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useTrackrData } from "@/hooks/use-trackr-data";

export default function AlertsPage() {
  const data = useTrackrData();
  const router = useRouter();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [severity, setSeverity] = useState<"all" | "low" | "medium" | "high">("all");
  const markRead = useMutation(api.notifications.markRead);
  const alerts = useQuery(api.notifications.listRecent, {
    limit: 100,
    unreadOnly,
    severity: severity === "all" ? undefined : severity,
  });

  return (
    <div className="min-h-dvh bg-background">
      <Header
        month={data.month}
        onMonthChange={data.setMonth}
        search={data.search}
        onSearchChange={data.setSearch}
        onAddTransaction={() => router.push("/transactions#add-transaction")}
      />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
            <p className="text-sm text-muted-foreground">Track budget, receipt, and goal events.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant={unreadOnly ? "secondary" : "outline"} onClick={() => setUnreadOnly((v) => !v)}>
              {unreadOnly ? "Unread only" : "All alerts"}
            </Button>
            {(["all", "low", "medium", "high"] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={severity === value ? "secondary" : "outline"}
                onClick={() => setSeverity(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent alerts</CardTitle>
            <CardDescription>{alerts?.length ?? 0} items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts?.length === 0 && <p className="text-sm text-muted-foreground">No alerts found.</p>}
            {alerts?.map((alert) => (
              <div key={alert._id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {alert.type} · {alert.severity ?? "medium"} · {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.readAt ? (
                    <Button size="sm" variant="outline" onClick={() => markRead({ notificationId: alert._id })}>
                      Mark read
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Read</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
