---
name: trackr-backend-contract-implementation
description: Implement Trackr Convex APIs to match BACKEND_CONTRACT with strict validation, auth checks, and ownership.
---

# Trackr Backend Contract Implementation

Use this skill when implementing or updating Convex APIs to match `docs/BACKEND_CONTRACT.md`.

## Primary Targets

- `users.store`, `users.me`
- `transactions.create`, `transactions.update`, `transactions.remove`, `transactions.list`
- `analytics.monthSummary`, `analytics.categoryBreakdown`, `analytics.monthlyIncomeExpense`
- `budgets.upsert`, `budgets.listByMonth`
- `exports.transactionsCsv`

## Implementation Steps

1. Define or update schema fields/indexes first.
2. Implement helpers for:
   - auth identity requirement
   - local user lookup
   - ownership validation (category/transaction/budget)
3. Implement each function with validators and bounded indexed queries.
4. Keep error semantics stable and explicit.
5. Ensure return payloads are chart/list friendly for frontend.

## Contract Rules

- Never accept a user identifier from clients for authorization.
- Derive user scope from `ctx.auth.getUserIdentity()`.
- Validate positive numeric amounts and date/month formats.
- Enforce category ownership before write operations.
- Ensure pagination for list endpoints.

## Verification

- Typecheck generated Convex API references.
- Run lint/tests for Convex files.
- Manually validate auth failures, unauthorized access, and missing resource paths.
