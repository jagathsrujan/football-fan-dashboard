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

## Phase 3b — Team Detail

- [ ] `/teams/[id]` renders a large crest, team name, country metadata, and competition tags from `/api/teams/[id]`.
- [ ] Favorite star appears as a ghost icon button with a 36px touch target and does not throw when clicked.
- [ ] Squad tab fetches `/api/teams/[id]/squad`, groups players under GK/DEF/MID/FWD headers, and renders loading, empty, and error + retry states.
- [ ] Fixtures tab fetches `/api/teams/[id]/fixtures`, separates upcoming and recent matches, and renders loading, empty, and error + retry states.
- [ ] Form tab fetches `/api/teams/[id]/form`, shows W/D/L chips plus a goals-for/goals-against Recharts line chart, and renders loading, empty, and error + retry states.
- [ ] Tab underline animates between Squad, Fixtures, and Form.
- [ ] Mobile bottom navigation does not obscure the final content or any retry controls.
- [ ] Browser Network tab on `/teams/[id]` shows requests only to this app's `/api/*` routes, with zero requests to `football-data.org`.
