import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import ConvexClientProvider from "@/components/convex-client-provider";
import { SignedInNav } from "@/components/layout/signed-in-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trackr - Personal Expense Tracker",
  description: "Track income, expenses, budgets, and analytics in one dashboard.",
};

const themeBootstrapScript = `(() => {
  try {
    const key = "trackr-theme";
    const saved = localStorage.getItem(key);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  } catch {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ClerkProvider dynamic>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ConvexClientProvider>
              <header className="border-b border-border">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
                  <Link href="/" className="text-sm font-semibold tracking-tight">
                    Trackr
                  </Link>
                  <Show when="signed-out">
                    <SignInButton mode="modal">
                      <Button variant="outline" size="sm">
                        Sign in
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="sm">Sign up</Button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <SignedInNav />
                  </Show>
                </div>
              </header>
              {children}
              <Toaster richColors position="top-right" />
            </ConvexClientProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
