# Stack Docs and Setup Guide

For complete project context, start at `docs/README.md`.

## Selected Stack
- Next.js (App Router + TypeScript)
- Tailwind CSS
- Clerk Authentication
- Convex Backend (database + queries/mutations + real-time client)

## Official Documentation
- Next.js Installation and App Router: [nextjs.org/docs/app/getting-started/installation](https://nextjs.org/docs/app/getting-started/installation)
- Tailwind CSS with Next.js: [tailwindcss.com/docs/installation/framework-guides/nextjs](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- Clerk Next.js Quickstart: [clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs)
- Convex Next.js + Clerk: [docs.convex.dev/client/nextjs/app-router](https://docs.convex.dev/client/nextjs/app-router)
- Convex Auth with Clerk: [docs.convex.dev/auth/clerk](https://docs.convex.dev/auth/clerk)

## What Is Already Initialized
- Next.js project scaffolded with TypeScript + Tailwind.
- `@clerk/nextjs` and `convex` dependencies installed.
- Convex local deployment initialized via `npx convex dev --once`.
- Convex + Clerk provider wiring added to root layout.
- `proxy.ts` added for Clerk request handling in Next.js 16.
- Convex schema and starter functions added:
  - `convex/schema.ts`
  - `convex/auth.config.ts`
  - `convex/users.ts`
  - `convex/expenses.ts`
  - `convex/analytics.ts`

## Environment Variables

### Already set in `.env.local`
- `CONVEX_DEPLOYMENT`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`

### You still need to add for Clerk
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Notes:
- Configure Clerk JWT issuer in `convex/auth.config.ts` by uncommenting the provider.
- Use the issuer domain from the Clerk JWT template configured for Convex.
- `CLERK_SECRET_KEY` must remain server-only.

## Run Locally
1. Add Clerk environment variables in `.env.local`.
2. In one terminal, start Convex:
   - `npx convex dev`
3. In another terminal, start Next.js:
   - `npm run dev`
4. Open `http://localhost:3000`.

## Current Architecture
- **Frontend (Next.js)**: Renders dashboard and forms in `app/page.tsx`.
- **Auth (Clerk)**: `ClerkProvider` in `app/layout.tsx` + `proxy.ts`.
- **Data Layer (Convex)**:
  - User bootstrap via `users.store`.
  - Expense CRUD baseline via `expenses.create`, `expenses.listRecent`, `expenses.remove`.
  - Monthly summary via `analytics.monthlySummary`.
  - Planned migration to PRD-aligned `transactions` and `budgets` model.

## Suggested Next Implementations
- Migrate to unified `transactions` schema (`income|expense`) using roadmap migration sequence.
- Add category CRUD + defaults seeding.
- Add budgets with threshold alerts and overview page.
- Add dashboard chart suite (6-month bar + category donut + month selector).
- Add CSV export and tests for Convex functions/UI flows.
