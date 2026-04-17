# Architecture Overview

## High-Level Design
- **Frontend**: Next.js App Router in `app/` (current repo uses Next.js 16).
- **Styling**: Tailwind CSS.
- **Authentication**: Clerk via `@clerk/nextjs`.
- **Backend**: Convex (database + server functions + generated client API).
- **Authorization boundary**: Convex functions enforce user checks server-side.

## Target Product Domains (PRD-aligned)
- Authentication and profile
- Transactions (income + expense)
- Categories (default + custom)
- Budgets (monthly per category)
- Analytics dashboard
- CSV export

## Data Flow (Target V1)
1. User authenticates with Clerk and enters protected app routes.
2. UI calls `users.store` after auth to ensure local user row exists.
3. Transactions are written/read through `transactions.*` functions.
4. Analytics functions aggregate by month/category and stream to dashboard charts.
5. Budget functions provide per-category limits and progress state.
6. CSV export action generates month-scoped data payload for download.
7. Convex subscriptions keep dashboard and lists in sync in near real-time.

## Auth and Security Flow
- `app/layout.tsx` wraps app with:
  - `ClerkProvider`
  - `ConvexProviderWithClerk` (via `components/convex-client-provider.tsx`)
- `proxy.ts` runs Clerk middleware for route-level auth context in Next.js 16.
- Convex auth helpers in `convex/lib/auth.ts` enforce:
  - Identity existence (`requireUserIdentity`)
  - User record existence (`getCurrentUser`)
- All data-access functions call `getCurrentUser` before reading/writing user-owned data.

## Data Model Summary (Target V1)
- `users`: identity mapping + profile preferences.
- `categories`: default and custom categories.
- `transactions`: unified income/expense ledger.
- `budgets`: month-based category limits.

See `docs/BACKEND_CONTRACT.md` for exact fields and function contracts.

## Folder Responsibilities
- `app/`: pages, layout, and UI-level orchestration.
- `components/`: reusable client components/providers.
- `convex/`: schema, auth config, and backend functions.
- `docs/`: product + technical documentation.

## Current Constraints
- MVP UI exists on a single route (`app/page.tsx`).
- Current backend implementation still uses `expenses` table.
- Target PRD requires migration to `transactions` + `budgets`.
- Category CRUD and budget UI flows are not yet implemented.

## Migration Strategy (Current -> Target)
1. Add `transactions` and `budgets` tables without removing `expenses`.
2. Add PRD-aligned server functions (`transactions.*`, `budgets.*`, analytics expansions).
3. Backfill `expenses` rows into `transactions` with `type = expense`.
4. Switch UI to `transactions` API surface.
5. Deprecate `expenses` contract after parity testing.

## Recommended Refactors
- Split dashboard into reusable components under `components/dashboard/`.
- Add route separation:
  - `/dashboard`
  - `/transactions`
  - `/budgets`
  - `/settings`
- Add shared validation and formatter utilities (`lib/`).
