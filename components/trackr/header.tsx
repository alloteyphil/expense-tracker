"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Plus, Search, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { formatMonthYear } from "@/lib/format"

interface HeaderProps {
  month: Date
  onMonthChange: (d: Date) => void
  search: string
  onSearchChange: (v: string) => void
  onAddTransaction: () => void
}

export function Header({ month, onMonthChange, search, onSearchChange, onAddTransaction }: HeaderProps) {
  const prev = () => {
    const d = new Date(month)
    d.setMonth(d.getMonth() - 1)
    onMonthChange(d)
  }
  const next = () => {
    const d = new Date(month)
    d.setMonth(d.getMonth() + 1)
    onMonthChange(d)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="Trackr home">
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
          >
            <Wallet className="size-4" />
          </span>
          <span className="text-base sm:text-lg">Trackr</span>
        </Link>

        {/* Month selector */}
        <div className="ml-2 hidden items-center gap-1 rounded-lg border border-border bg-card p-1 sm:flex">
          <Button
            size="icon"
            variant="ghost"
            className="size-7"
            onClick={prev}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium tabular-nums">
            {formatMonthYear(month)}
          </span>
          <Button size="icon" variant="ghost" className="size-7" onClick={next} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="ml-auto hidden w-full max-w-xs md:block">
          <InputGroup>
            <InputGroupAddon>
              <Search className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search transactions"
            />
          </InputGroup>
        </div>

        {/* Add transaction */}
        <Button
          onClick={onAddTransaction}
          className="ml-auto gap-2 md:ml-0"
          size="sm"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full"
              aria-label="Open account menu"
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
                  KA
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Kwame Asante</span>
                <span className="text-xs text-muted-foreground">kwame@trackr.gh</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Account</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Export data</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile secondary row: month + search */}
      <div className="flex items-center gap-2 border-t border-border px-4 py-2 sm:hidden">
        <div className="flex flex-1 items-center gap-1 rounded-lg border border-border bg-card p-1">
          <Button size="icon" variant="ghost" className="size-7" onClick={prev} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="flex-1 text-center text-sm font-medium tabular-nums">
            {formatMonthYear(month)}
          </span>
          <Button size="icon" variant="ghost" className="size-7" onClick={next} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search transactions"
          />
        </InputGroup>
      </div>
    </header>
  )
}
