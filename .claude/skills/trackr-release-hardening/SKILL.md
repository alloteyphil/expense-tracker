---
name: trackr-release-hardening
description: Apply final quality gates for Trackr including tests, accessibility, performance, and docs consistency.
---

# Trackr Release Hardening

Use this skill before merge/release once major features are implemented.

## Quality Gates

- Lint/typecheck clean.
- Convex API contracts validated against frontend callsites.
- Key user journeys manually verified (auth, CRUD, dashboard, budgets, export, notifications).
- Accessibility pass on interactive components (labels, keyboard, focus, dialog behavior).
- Performance checks on dashboard route.

## Documentation Gate

If schema or Convex functions changed:

- Update `docs/BACKEND_CONTRACT.md`.
- Update `docs/ARCHITECTURE.md`.
- Adjust `docs/ROADMAP.md` progress markers.

## Release Checklist

1. Run lint/tests and fix regressions.
2. Smoke test authenticated and unauthenticated states.
3. Verify export output format and encoding.
4. Confirm recurring automation path does not duplicate rows.
5. Confirm notifications are user-scoped and readable.
