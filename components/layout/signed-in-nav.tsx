"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Moon, Settings, Sun, User } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/budgets", label: "Budgets" },
  { href: "/analytics", label: "Analytics" },
  { href: "/goals", label: "Goals" },
  { href: "/alerts", label: "Alerts" },
  { href: "/receipts", label: "Receipts" },
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function SignedInNav() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const canQuery = isLoaded && isSignedIn;
  const appUser = useQuery(api.users.me, canQuery ? {} : "skip");
  const unreadAlerts = useQuery(api.notifications.unreadCount, canQuery ? {} : "skip");
  const households = useQuery(api.households.listMine, canQuery ? {} : "skip");
  const createHousehold = useMutation(api.households.create);
  const { setTheme } = useTheme();
  const displayName = appUser?.name ?? user?.fullName ?? user?.username ?? "User";
  const initials = initialsFor(displayName) || "U";
  const activeHouseholdName = households?.[0]?.name ?? "Personal";

  return (
    <>
      <nav className="hidden items-center gap-1 md:flex">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link href={item.href} className="inline-flex items-center gap-1.5">
                <span>{item.label}</span>
                {item.href === "/alerts" && (unreadAlerts ?? 0) > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {unreadAlerts}
                  </span>
                ) : null}
              </Link>
            </Button>
          );
        })}
      </nav>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-full border border-border px-2 py-1 transition outline-none focus-visible:ring-[3px]",
            )}
            aria-label="Open account menu"
          >
            <span className="hidden max-w-36 truncate text-sm text-muted-foreground sm:block">
              Hi, {displayName}
            </span>
            <Avatar>
              <AvatarImage src={user?.imageUrl} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {navItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="inline-flex items-center gap-1.5">
                <span>{item.label}</span>
                {item.href === "/alerts" && (unreadAlerts ?? 0) > 0 ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                    {unreadAlerts}
                  </span>
                ) : null}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Active household: {activeHouseholdName}
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={async () => {
              const name = window.prompt("New household name");
              if (!name?.trim()) return;
              await createHousehold({ name: name.trim() });
            }}
          >
            Create household
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <Sun className="size-4" />
            Light theme
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <Moon className="size-4" />
            Dark theme
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <SignOutButton fallbackRedirectUrl="/">
              <button type="button" className="w-full text-left">
                Sign out
              </button>
            </SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
