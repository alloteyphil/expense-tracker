# Product Requirements Document (PRD)

## Product
Trackr - Personal Expense Tracker

## Metadata
- Version: 1.0
- Status: Draft
- Author: Philip
- Date: 17 April 2026
- Stack target: Next.js + TypeScript + Convex + Clerk + Tailwind + Recharts

## Overview

### Problem statement
Most people in Ghana and across Africa manage finances informally and do not have clear month-to-month spending visibility. Existing tools are often optimized for Western markets, are expensive, or are too complex.

Trackr is a clean, fast, real-time web app that helps users log income/expenses, monitor category budgets, and understand spending behavior with visual analytics.

### Product goals
- Give users one place to track all financial transactions.
- Surface spending patterns through clear analytics.
- Enable monthly budget limits per category with alerts.
- Provide CSV export for external analysis.
- Deliver smooth experience on desktop and mobile.

### Non-goals (v1)
- No bank/mobile money integrations.
- No multi-currency support (single currency per account).
- No shared or household accounts.
- No native iOS/Android app.

## Target Users

### Primary persona
Young professionals (22-35) with salary or freelance income, currently tracking poorly or not at all, and trying to improve savings habits.

### Secondary persona
Freelancers/small business owners who need a simple personal/business expense summary.

## Feature Requirements

## Authentication
- Sign up/login with email/password and Google OAuth via Clerk (P0).
- Profile includes display name and preferred currency (default GHS) (P0).
- All app routes require authenticated session (P0).

## Transactions
- Add transaction: amount, type (income/expense), category, date, optional note (P0).
- Edit transaction (modal or inline) (P0).
- Delete transaction with confirmation (P0).
- Transaction list: paginated, newest first, searchable by note/amount (P0).
- Filters by date range, category, type (P1).
- Recurring transactions with weekly/monthly schedules (P2).

## Categories
- Default categories: Food, Transport, Bills, Entertainment, Health, Shopping, Other (P0).
- Custom categories with color and icon (P1).
- Every transaction belongs to exactly one category (P0).

## Budgets
- Monthly budget limits per category (P1).
- Progress UI with threshold states at 80% and 100% (P1).
- In-app over-budget toast alerts (P1).
- Budget overview page for current month (P1).

## Dashboard and Analytics
- Summary cards: total income, total expenses, net balance for selected month (P0).
- Monthly bar chart: income vs expense, last 6 months (P0).
- Category donut chart for selected month (P0).
- Month selector for historical views (P1).
- Daily cumulative spend line chart (P2).

## Export and UX Polish
- CSV export by selected month (P1).
- Empty states and zero-result states with CTA (P0).
- Loading skeletons for data views (P0).
- Fully responsive at 375px and above (P0).

## Functional Acceptance Criteria (P0)
1. Users can authenticate and access protected app routes only when signed in.
2. Users can create, edit, and delete transactions; UI updates without manual refresh.
3. Users can view paginated transaction list sorted newest-first.
4. Dashboard renders total income, total expenses, and net balance for selected month.
5. Category donut and monthly bar chart render valid data for authenticated user.
6. All major pages support loading and empty states on mobile and desktop.

## Non-Functional Requirements
- Performance: dashboard route renders under 2 seconds on broadband.
- Realtime: new/edited/deleted transaction visible within 500ms.
- Security: auth and ownership checks in all Convex public functions.
- Reliability: no silent data loss on create/update/delete.
- DX: strict TypeScript and generated Convex types.

## Data Model Requirements
- Store monetary values in smallest currency unit (pesewas for GHS) to avoid float errors.
- Scope all user data by authenticated user identity.
- Use canonical month key format `YYYY-MM` for budget rows.

## Success Metrics
- All P0 features shipped and stable in production.
- Lighthouse mobile score >= 90.
- CSV export works for any selected month.
- Zero critical launch bugs (broken auth, data loss, blocked dashboard).

## Out of Scope for V1
- Bank/mobile money APIs (MTN MoMo, Vodafone Cash, Zeepay).
- Multi-currency conversion.
- Shared/team accounts.
- Native mobile apps.
- AI spending recommendations.
- Paid subscription features.

## Build Phases
1. Foundation (~2 days): setup, auth, schema, base layout/nav.
2. Core Features (~4 days): transaction CRUD, categories, filters, realtime list.
3. Dashboard (~3 days): summary cards, bar chart, donut chart, month selector.
4. Polish (~2 days): CSV export, recurring transactions, budget alerts, responsive QA.

Estimated delivery: ~11 focused development days.

## Implementation Alignment Note (Current Repo)
- Current codebase currently uses an `expenses`-only model for MVP.
- Target v1 PRD uses a unified `transactions` model with `type: income|expense`.
- Planned migration path is documented in `docs/BACKEND_CONTRACT.md` and `docs/ROADMAP.md`.
