# Implementation Roadmap

Roadmap synced to Trackr PRD v1.

## Phase 1 - Foundation (Complete)
- [x] Next.js + Tailwind app initialized
- [x] Clerk auth integration and protected routing baseline (`proxy.ts`)
- [x] Convex project setup and generated types
- [x] Initial dashboard shell and expense entry UI

## Phase 2 - Core Data Model Migration (Next)
Goal: migrate from `expenses` model to unified `transactions` model.

- [x] Add `transactions` table to schema:
  - `type: income|expense`
  - `amountMinor` (smallest unit)
  - recurrence fields
- [x] Add `budgets` table with `month: YYYY-MM`
- [x] Add PRD-aligned category fields (`icon`, defaults strategy)
- [ ] Build migration script to copy `expenses` -> `transactions` (`type = expense`)
- [ ] Keep backward compatibility until UI switch is complete

## Phase 3 - P0 Feature Completion
- [x] Transactions CRUD:
  - create
  - edit
  - delete with confirmation
- [x] Paginated transaction list with search (note/amount)
- [x] Default categories seeded per user
- [x] Dashboard P0 metrics:
  - total income
  - total expenses
  - net balance
- [x] Dashboard charts:
  - 6-month income vs expense bar chart
  - selected-month category donut chart
- [x] Loading skeletons + empty states on all key views
- [x] Responsive support validated at 375px+

## Phase 4 - P1 Features
- [x] Month selector and historical navigation
- [x] Filters by date range, category, and type
- [x] Budgets:
  - set monthly budget per category
  - progress bars with threshold colors
  - over-budget toast alerts
  - budget overview page
- [x] CSV export by selected month
- [x] Profile settings (display name + preferred currency default GHS)
- [x] Route split for product surfaces:
  - `/dashboard`
  - `/transactions`
  - `/budgets`
  - `/analytics`
  - `/profile`
- [x] Avatar dropdown navigation with app links and account actions
- [x] Saved transaction filter presets
- [x] Budget variance trend card
- [x] Recurring transaction next-run preview

## Phase 5 - P2 and Hardening
- [x] Recurring transactions (weekly/monthly schedule)
- [ ] Daily cumulative spend line chart
- [x] Test suite expansion (utilities baseline via `tests/trackr-utils.test.ts`)
- [x] Accessibility audit and fixes (menu labels, keyboard-friendly navigation controls)
- [x] Performance pass (client orchestration extracted to shared hook and route-scoped rendering)

## Execution Notes
- Implement backend contract first, then wire UI.
- Current implementation uses Convex queries/mutations across dashboard, transactions, budgets, and analytics routes.
- Every schema/function change must update:
  - `docs/BACKEND_CONTRACT.md`
  - `docs/ARCHITECTURE.md`
- Keep migration code until production parity checks pass.
