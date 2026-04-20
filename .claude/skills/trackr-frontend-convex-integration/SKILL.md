---
name: trackr-frontend-convex-integration
description: Replace Trackr mock dashboard state with Convex queries and mutations while preserving UX quality.
---

# Trackr Frontend Convex Integration

Use this skill when migrating UI behavior from mock data to live Convex data.

## Scope

- Dashboard KPIs and charts
- Transaction create/list/delete/edit flows
- Budget progress and quick filters
- Loading, empty, and error states

## Migration Sequence

1. Replace data sources in `app/page.tsx`:
   - remove mock arrays for primary rendering
   - wire `useQuery` and `useMutation` calls
2. Keep component interfaces stable where possible; adapt props to server payloads.
3. Preserve user feedback behavior:
   - toast success/error
   - visible loading skeletons
   - actionable empty states
4. Ensure list filtering/pagination state works against backend queries.

## UX Guardrails

- No blocking spinners for full page if partial data can render.
- Always handle query `undefined` and action failures.
- Keep mobile responsiveness and interaction parity.

## Done Criteria

- No mock transaction/budget source is used by main dashboard path.
- Convex state updates are reflected without manual refresh.
- Existing cards/charts/list remain usable on 375px+ screens.
