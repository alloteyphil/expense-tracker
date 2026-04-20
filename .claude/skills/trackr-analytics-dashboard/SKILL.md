---
name: trackr-analytics-dashboard
description: Implement month-scoped analytics endpoints and dashboard visualizations for Trackr.
---

# Trackr Analytics Dashboard

Use this skill for analytics data modeling and dashboard chart integration.

## Required Analytics

- Month summary: income, expense, net, count
- Category breakdown: expense distribution for selected month
- Monthly series: 6-month income vs expense chart

## Backend Patterns

- Query `transactions` through indexes by user and date range.
- Aggregate in memory after bounded indexed reads.
- Return normalized payloads for chart components (stable keys and labels).

## Frontend Patterns

- Treat analytics queries as primary source for KPI and chart sections.
- Keep graceful fallback UI when no transactions exist.
- Keep axis/label formatting consistent with preferred currency display.

## Performance Notes

- Avoid N+1 lookups for category labels where possible.
- Keep selected month as explicit query argument.
- Reuse common date-range helpers between analytics endpoints.
