# QA Checklists

## Phase 3a — Competitions Browsing

- [ ] `/competitions` renders a competition grid from `/api/competitions`.
- [ ] Filter chips update the visible grid without a page reload: All, Leagues, Cups, Continental, International.
- [ ] `/competitions/[code]` renders the competition header with emblem, name, code, and season label.
- [ ] Table tab shows a skeleton while loading, an `EmptyState` when standings are empty, and an error `EmptyState` with retry on failed fetch.
- [ ] Scorers tab shows a skeleton while loading, an `EmptyState` when no scorer rows exist, and an error `EmptyState` with retry on failed fetch.
- [ ] Fixtures tab shows a skeleton while loading, an `EmptyState` when no fixtures exist, and an error `EmptyState` with retry on failed fetch.
- [ ] Standings table horizontally scrolls on mobile and keeps the position column sticky.
- [ ] Browser Network tab on `/competitions` and `/competitions/[code]` shows requests only to this app's `/api/*` routes, with zero requests to `football-data.org`.
- [ ] API 404 responses return `{ "error": "...", "code": "NOT_FOUND" }`.
