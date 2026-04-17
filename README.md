# Expense Tracker + Analytics Dashboard

Starter app using:
- Next.js App Router
- Tailwind CSS
- Clerk authentication
- Convex backend

## Project Docs
- Docs index: `docs/README.md`
- PRD: `docs/PRD.md`
- Stack + setup guide: `docs/STACK_AND_SETUP.md`
- Architecture: `docs/ARCHITECTURE.md`
- Backend contract: `docs/BACKEND_CONTRACT.md`
- Roadmap: `docs/ROADMAP.md`
- Contributing guide: `docs/CONTRIBUTING.md`

## Local Setup

1. Install dependencies:
```bash
npm install
```

2. Add Clerk variables to `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Then configure Clerk issuer domain in `convex/auth.config.ts`.

3. Start Convex:
```bash
npx convex dev
```

4. Start Next.js:
```bash
npm run dev
```

5. Open:
- [http://localhost:3000](http://localhost:3000)

## Current Features
- Clerk sign-in/sign-up integration
- Convex-backed user bootstrap
- Create/list/delete expenses
- Monthly analytics summary cards
