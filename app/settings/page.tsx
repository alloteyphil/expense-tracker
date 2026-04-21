"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/components/theme-provider";
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
  const createHousehold = useMutation(api.households.create);
  const inviteToHousehold = useMutation(api.households.invite);
  const households = useQuery(api.households.listMine, isSignedIn ? {} : "skip");
  const invites = useQuery(api.households.listInvites, isSignedIn ? {} : "skip");

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [preferredCurrencyDraft, setPreferredCurrencyDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "viewer">("member");
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

  const onCreateHousehold = async () => {
    if (!householdName.trim()) return;
    await createHousehold({ name: householdName.trim() });
    setHouseholdName("");
    toast.success("Household created");
  };

  const onInvite = async () => {
    const householdId = households?.[0]?.householdId;
    if (!householdId || !inviteEmail.trim()) return;
    await inviteToHousehold({
      householdId,
      email: inviteEmail.trim(),
      role: inviteRole,
    });
    setInviteEmail("");
    toast.success("Invite sent");
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Current display name: <span className="font-medium text-foreground">{user?.name ?? "Not set"}</span>
          </p>
        </div>
        <Button variant="outline" asChild className="w-full sm:w-auto">
          <Link href="/dashboard">Back to dashboard</Link>
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Household sharing</CardTitle>
          <CardDescription>Create a household and invite members/viewers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="household-name">Household name</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="household-name"
                value={householdName}
                onChange={(event) => setHouseholdName(event.target.value)}
                placeholder="My family budget"
              />
              <Button onClick={onCreateHousehold} variant="outline">
                Create
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Invite by email</Label>
            <div className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                placeholder="teammate@example.com"
              />
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as "member" | "viewer")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={onInvite}>Invite</Button>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Active household: {households?.[0]?.name ?? "Personal"} · pending invites: {invites?.length ?? 0}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
