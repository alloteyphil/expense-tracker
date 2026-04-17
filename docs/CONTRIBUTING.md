# Contributing Guide

## Development Workflow
1. Pull latest changes.
2. Create a feature branch.
3. Run local stack:
   - `npx convex dev`
   - `npm run dev`
4. Make focused changes.
5. Run checks:
   - `npm run lint`
6. Update docs for any schema/API/behavior changes.

## Coding Conventions
- TypeScript strict mode, avoid `any`.
- Keep Convex wrappers thin; move complex logic into helper functions.
- Enforce auth checks on all public Convex functions handling user data.
- Keep UI components small and composable.

## Backend Conventions (Convex)
- Add indexes for frequent query access patterns.
- Use `.withIndex(...)` over broad filtering where possible.
- Do not use `Date.now()` in Convex queries; pass time as arg.
- Use descriptive errors for auth/ownership failures.

## Documentation Requirements
- Product scope changes -> update `docs/PRD.md`.
- Setup/runtime changes -> update `docs/STACK_AND_SETUP.md`.
- Contract/schema changes -> update `docs/BACKEND_CONTRACT.md`.
- Milestone changes -> update `docs/ROADMAP.md`.

## Pull Request Checklist
- [ ] Feature works locally.
- [ ] Lint passes.
- [ ] Docs updated.
- [ ] No secrets committed.
- [ ] Scope is clear and bounded.
