"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currencies = ["GHS", "USD", "EUR", "NGN"] as const;

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();
  const user = useQuery(api.users.me, isSignedIn ? {} : "skip");
  const updateProfile = useMutation(api.users.updateProfile);

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [preferredCurrencyDraft, setPreferredCurrencyDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const name = nameDraft ?? user?.name ?? "";
  const preferredCurrency = preferredCurrencyDraft ?? user?.preferredCurrency ?? "GHS";
  const activeTheme = theme ?? "system";

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground">
        Loading settings...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Your settings are only available for authenticated users.</CardDescription>
          </CardHeader>
          <CardContent>
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </main>
    );
  }

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim() || undefined,
        preferredCurrency,
      });
      setNameDraft(null);
      setPreferredCurrencyDraft(null);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name and preferred currency.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(event) => setNameDraft(event.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferred-currency">Preferred currency</Label>
            <Select value={preferredCurrency} onValueChange={setPreferredCurrencyDraft}>
              <SelectTrigger id="preferred-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Trackr looks across the app.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select value={activeTheme} onValueChange={setTheme}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </main>
  );
}
