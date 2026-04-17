# Project Documentation Index

Use this folder as the single source of product and technical context.

## Start Here
- `docs/PRD.md`: Trackr product requirements (synced from latest PRD draft).
- `docs/STACK_AND_SETUP.md`: Stack choices and environment setup.

## Engineering Context
- `docs/ARCHITECTURE.md`: System architecture, data flow, and folder ownership.
- `docs/BACKEND_CONTRACT.md`: Convex schema and function contracts used by the UI.
- `docs/ROADMAP.md`: Delivery phases and next implementation priorities.
- `docs/CONTRIBUTING.md`: Development workflow, coding conventions, and quality gates.

## How to Use This Docs Set
- For product decisions, start in `docs/PRD.md`.
- For implementation details, check `docs/ARCHITECTURE.md` and `docs/BACKEND_CONTRACT.md`.
- For planning, update `docs/ROADMAP.md`.
- For team consistency, follow `docs/CONTRIBUTING.md`.
- For migration work, follow the `Current -> Target` notes in architecture and backend contract docs.

## Documentation Maintenance Rules
- Keep docs updated in the same PR as code changes.
- Reflect schema or API changes in `docs/BACKEND_CONTRACT.md`.
- Reflect major feature or scope changes in `docs/PRD.md`.
- If implementation differs from docs, update docs first or immediately after code changes.
