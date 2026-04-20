# Backend Contract (Convex)

This contract is aligned to the Trackr v1 PRD.

## Data Ownership Strategy
- All user-scoped tables use `userId: Id<"users">`.
- Clerk identity is mapped to local user record through `users.tokenIdentifier`.
- Public Convex functions must enforce auth and ownership checks.

## Schema (Target V1)

## `users`
- `tokenIdentifier: string` (index: `by_token`)
- `email: string`
- `name?: string`
- `imageUrl?: string`
- `preferredCurrency: string` (default `"GHS"`)

## `categories`
- `userId: Id<"users"> | null` (`null` for system defaults)
- `name: string`
- `icon: string`
- `color: string`
- `isDefault: boolean`

Recommended indexes:
- `by_user`
- `by_user_and_name`
- `by_default`

## `transactions`
- `userId: Id<"users">`
- `amountMinor: number` (smallest unit; pesewas for GHS)
- `type: "income" | "expense"`
- `categoryId: Id<"categories">`
- `note?: string`
- `merchant?: string`
- `date: number` (unix ms)
- `isRecurring: boolean`
- `recurringInterval: "weekly" | "monthly" | null`
- `createdAt: number`
- `updatedAt: number`

Recommended indexes:
- `by_user_and_date`
- `by_user_and_type_and_date`
- `by_user_and_category_and_date`

## `budgets`
- `userId: Id<"users">`
- `categoryId: Id<"categories">`
- `limitMinor: number`
- `month: string` (`YYYY-MM`)

Recommended indexes:
- `by_user_and_month`
- `by_user_and_category_and_month`

## `tags`
- `userId: Id<"users">`
- `name: string`
- `color?: string`
- `createdAt: number`

## `transactionTags`
- `userId: Id<"users">`
- `transactionId: Id<"transactions">`
- `tagId: Id<"tags">`

## `notifications`
- `userId: Id<"users">`
- `title: string`
- `message: string`
- `type: "budget" | "recurring" | "system"`
- `readAt?: number`
- `createdAt: number`
- `metadata?: { month?: string, categoryId?: Id<"categories"> }`

## Public Functions (Target V1)

## `users.store` (mutation)
- Upserts signed-in user from Clerk identity and returns `Id<"users">`.

## `users.me` (query)
- Returns current local user record.

## `transactions.create` (mutation)
- Creates one transaction row.
- Validates:
  - valid category ownership
  - `amountMinor > 0`
  - valid `type`

## `transactions.update` (mutation)
- Updates editable fields on owned transaction.

## `transactions.remove` (mutation)
- Deletes owned transaction (or archive if soft-delete policy is adopted).

## `transactions.list` (query)
- Paginated list sorted newest-first.
- Supports filters:
  - date range
  - category
  - type
  - search text (note/merchant)

## `analytics.monthSummary` (query)
- Returns:
  - `totalIncomeMinor`
  - `totalExpenseMinor`
  - `netBalanceMinor`
  - `transactionCount`

## `analytics.categoryBreakdown` (query)
- Expense distribution by category for selected month.

## `analytics.monthlyIncomeExpense` (query)
- 6-month series for dashboard bar chart.

## `budgets.upsert` (mutation)
- Sets monthly budget for category.

## `budgets.listByMonth` (query)
- Budget rows and progress values for selected month.

## `exports.transactionsCsv` (action)
- Produces CSV payload for selected month and user.

## Additional public functions implemented
- `categories.list`, `categories.create`, `categories.remove`, `categories.seedDefaults`
- `tags.list`, `tags.create`
- `notifications.listRecent`, `notifications.create`, `notifications.markRead`
- `users.updateProfile`

## Internal recurring automation
- `recurring.materializeDue` (internal mutation)
- Cron in `convex/crons.ts` calls materialization on interval.

## Error Semantics
- `Not authenticated`
- `User not found`
- `Unauthorized`
- `Category not found`
- `Transaction not found`
- `Validation error: <reason>`

## Migration Note: Current Repo -> Target V1
Current implementation uses `expenses` table and `expenses.*` functions. Target v1 uses unified `transactions`.

Migration sequence:
1. Add `transactions` table and matching indexes.
2. Introduce `transactions.*` functions alongside existing `expenses.*`.
3. Backfill data from `expenses` into `transactions` with `type = "expense"`.
4. Switch UI queries/mutations to `transactions.*` and new analytics endpoints.
5. Remove old `expenses` contract once parity is verified.

## Contract Change Checklist
- Update `convex/schema.ts`.
- Run `npx convex dev` (regenerate generated types).
- Update all frontend API callsites.
- Update `docs/ARCHITECTURE.md` + this file in same PR.
