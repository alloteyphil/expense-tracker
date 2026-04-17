# Implementation Roadmap

Roadmap synced to Trackr PRD v1.

## Phase 1 - Foundation (Complete)
- [x] Next.js + Tailwind app initialized
- [x] Clerk auth integration and protected routing baseline (`proxy.ts`)
- [x] Convex project setup and generated types
- [x] Initial dashboard shell and expense entry UI

## Phase 2 - Core Data Model Migration (Next)
Goal: migrate from `expenses` model to unified `transactions` model.

- [ ] Add `transactions` table to schema:
  - `type: income|expense`
  - `amountMinor` (smallest unit)
  - recurrence fields
- [ ] Add `budgets` table with `month: YYYY-MM`
- [ ] Add PRD-aligned category fields (`icon`, defaults strategy)
- [ ] Build migration script to copy `expenses` -> `transactions` (`type = expense`)
- [ ] Keep backward compatibility until UI switch is complete

## Phase 3 - P0 Feature Completion
- [ ] Transactions CRUD:
  - create
  - edit
  - delete with confirmation
- [ ] Paginated transaction list with search (note/amount)
- [ ] Default categories seeded per user
- [ ] Dashboard P0 metrics:
  - total income
  - total expenses
  - net balance
- [ ] Dashboard charts:
  - 6-month income vs expense bar chart
  - selected-month category donut chart
- [ ] Loading skeletons + empty states on all key views
- [ ] Responsive support validated at 375px+

## Phase 4 - P1 Features
- [ ] Month selector and historical navigation
- [ ] Filters by date range, category, and type
- [ ] Budgets:
  - set monthly budget per category
  - progress bars with threshold colors
  - over-budget toast alerts
  - budget overview page
- [ ] CSV export by selected month
- [ ] Profile settings (display name + preferred currency default GHS)

## Phase 5 - P2 and Hardening
- [ ] Recurring transactions (weekly/monthly schedule)
- [ ] Daily cumulative spend line chart
- [ ] Test suite expansion (Convex + UI integration)
- [ ] Accessibility audit and fixes
- [ ] Performance pass (mobile Lighthouse >= 90)

## Execution Notes
- Implement backend contract first, then wire UI.
- Every schema/function change must update:
  - `docs/BACKEND_CONTRACT.md`
  - `docs/ARCHITECTURE.md`
- Keep migration code until production parity checks pass.
