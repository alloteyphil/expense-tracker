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
- Goals planning
- Alerts center
- Receipt ingestion (OCR-lite)
- Household sharing and roles

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
- Convex auth providers are configured via `CLERK_JWT_ISSUER_DOMAIN` in `convex/auth.config.ts`.

## Data Model Summary (Target V1)
- `users`: identity mapping + profile preferences.
- `categories`: default and custom categories.
- `transactions`: unified income/expense ledger.
- `budgets`: month-based category limits.
- `tags` + `transactionTags`: optional transaction labels.
- `notifications`: in-app user-scoped alerts and reminders.
- `goals`: progress-based targets with optional shared household scope.
- `receipts`: upload + parse status for receipt-assisted entry.
- `households` + `householdMembers` + `householdInvites`: collaborative budgeting access model.

See `docs/BACKEND_CONTRACT.md` for exact fields and function contracts.

## Folder Responsibilities
- `app/`: pages, layout, and UI-level orchestration.
- `components/`: reusable client components/providers.
- `convex/`: schema, auth config, and backend functions.
- `docs/`: product + technical documentation.

## Current Constraints
- Product surface now spans domain routes (`/dashboard`, `/transactions`, `/budgets`, `/analytics`, `/settings`, `/profile`) with shared data hooks.
- Legacy `expenses` table is still kept for migration compatibility.
- Recurring generation exists, but advanced recurrence policy and conflict handling are basic.
- Tags are implemented in backend and need richer dedicated UI.

## Migration Strategy (Current -> Target)
1. Add `transactions` and `budgets` tables without removing `expenses`.
2. Add PRD-aligned server functions (`transactions.*`, `budgets.*`, analytics expansions).
3. Backfill `expenses` rows into `transactions` with `type = expense`.
4. Switch UI to `transactions` API surface.
5. Deprecate `expenses` contract after parity testing.

## Recommended Refactors
- Continue extracting route-level orchestration from `app/*/page.tsx` into reusable containers under `components/trackr/`.
- Expand current shared hooks approach (`hooks/use-trackr-data.ts`) with feature-scoped hooks (`useTransactionsFilters`, `useBudgetHealth`).
- Add richer analytics visualizations beyond current income/expense and category mix.
- Add shared validation and formatter utilities (`lib/`) for currency/date/query-param handling.

## Portfolio Upgrade Notes
- Signed-in navigation now uses an avatar dropdown in `components/layout/signed-in-nav.tsx` with quick links, theme toggle, and sign-out.
- Route split uses a shared Convex-backed data hook (`hooks/use-trackr-data.ts`) to reduce duplicated client orchestration.
- New product-depth signals:
  - Saved transaction filter presets (`/transactions`)
  - Budget variance trend (`/budgets`)
  - Recurring schedule preview (`/analytics`)
  - Goal planning route and dashboard widget (`/goals`)
  - Alerts inbox with unread/severity filtering (`/alerts`)
  - Receipt parse and prefill workflow (`/receipts`)
  - Household creation/invite flow in settings and nav

## Engineering Notes
- Tradeoff: Receipt flow is intentionally OCR-lite in MVP (text heuristic parser) to validate UX before adding full OCR service cost/latency.
- Tradeoff: Household switching currently defaults to first membership to keep onboarding simple while role checks are already enforced server-side.
- Health score is explainable by design: backend returns subscores and reasons to avoid opaque analytics.
