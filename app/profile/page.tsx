"use client";

import Link from "next/link";
import { SignInButton, UserProfile, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Your profile is only available for authenticated users.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4 flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/settings">Open app settings</Link>
        </Button>
      </div>
      <UserProfile routing="hash" />
    </main>
  );
}
