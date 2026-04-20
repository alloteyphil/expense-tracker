---
name: trackr-data-model-migration
description: Safely migrate Trackr from expenses to transactions and budgets using a widen-migrate-narrow workflow with parity checks.
---

# Trackr Data Model Migration

Use this skill when changing the schema from `expenses` to `transactions` and introducing `budgets`.

## Outcomes

- Keep production-safe compatibility while UI and backend transition.
- Add new tables/indexes first, then backfill data, then cut over reads/writes.
- Remove legacy paths only after parity checks pass.

## Required Inputs

- Current schema and function files under `convex/`.
- Contract docs: `docs/BACKEND_CONTRACT.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`.
- Migration scope: fields, indexes, and legacy compatibility window.

## Workflow

1. **Widen**
   - Add `transactions` and `budgets` schema entries and indexes.
   - Keep `expenses` table and handlers active.
   - Generate Convex types and fix compile errors.
2. **Migrate**
   - Add internal migration mutation(s) to copy historical `expenses` into `transactions` with `type: "expense"`.
   - Run migration in bounded batches.
   - Mark migrated rows idempotently to avoid duplicates.
3. **Dual read/write (temporary)**
   - Start writing new rows to `transactions`.
   - Keep read compatibility while frontend moves over.
4. **Narrow**
   - Switch UI and analytics to `transactions` APIs only.
   - Remove legacy `expenses` contract after parity checks.

## Guardrails

- Always use validators for every Convex function.
- Use indexed queries, avoid broad `.filter()` scanning.
- Keep error messages contract-aligned (`Not authenticated`, `User not found`, etc.).
- Treat all operations as user-scoped through auth-derived identity.

## Completion Checklist

- Schema includes target tables/indexes.
- Backfill script exists and is idempotent.
- Frontend uses `transactions` endpoints.
- Legacy `expenses` usage removed or explicitly marked for final cleanup.
- Docs updated in same PR.
