"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
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
  const { user } = useUser();
  const appUser = useQuery(api.users.me, {});
  const { setTheme } = useTheme();
  const displayName = appUser?.name ?? user?.fullName ?? user?.username ?? "User";
  const initials = initialsFor(displayName) || "U";

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
              <Link href={item.href}>{item.label}</Link>
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
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
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
            <SignOutButton>
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
