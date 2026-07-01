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

## Phase 3c — Player Detail

- [ ] `/players/[id]` renders a large 96px initials `PlayerAvatar`, name, position badge, current team crest, and nationality badge from `/api/players/[id]`.
- [ ] Player avatar uses Tier 1 initials fallback only; no Wikimedia, TheSportsDB, or external photo lookup is attempted.
- [ ] Club stats tab fetches `/api/players/[id]/stats`, renders StatCard summary tiles plus a season-by-season table, and includes loading, empty, and error + retry states.
- [ ] International stats tab fetches `/api/players/[id]/stats`, renders a distinct international stats view with the caption `Separate from club statistics.`, and includes loading, empty, and error + retry states.
- [ ] `/api/players/[id]/stats` response keeps `clubStats` and `internationalStats` as two distinct top-level keys.
- [ ] Club and international stat table numeric cells use `font-data` and `tabular-nums`.
- [ ] Browser Network tab on `/players/[id]` shows requests only to this app's `/api/*` routes, with zero requests to `football-data.org`.

## Phase 3d — Match Detail

- [ ] `/matches/[id]` renders competition tag, matchday, venue caption, team crests, team names, `ScoreDisplay`, and status badge from `/api/matches/[id]`.
- [ ] `/api/matches/[id]` returns `{ match, events, lineups }`, with `lineups: null` on the free tier.
- [ ] Match detail cache uses 30s TTL only for the live window: `SCHEDULED` within 15 minutes, `IN_PLAY`, or `PAUSED`; all other matches use long TTL.
- [ ] Event timeline is minute-ordered and keyboard-navigable with visible focus states.
- [ ] Goal, yellow card, red card, and substitution events show both an icon and text label; color is never the only signal.
- [ ] Every crest has descriptive alt text such as `Manchester City crest`.
- [ ] Lineups section renders `EmptyState` with `Lineups not available on the free tier`, never a blank section.
- [ ] `ScoreDisplay` split-flap digits remount on value change and respect `prefers-reduced-motion`.

## Phase 3e — Global Search

- [ ] `/api/search?q=haaland` returns `{ competitions: [], teams: [], players: [] }` grouped results.
- [ ] Search index is served from Upstash cache (`search-index:v1`, TTL 3600s); no Prisma queries per keystroke.
- [ ] Search overlay opens on topbar search icon click.
- [ ] Search overlay opens on ⌘K (macOS) or Ctrl+K (Windows/Linux).
- [ ] Input has visible `focus-visible:ring-2 focus-visible:ring-floodlight/40` focus ring matching design system.
- [ ] Input debounces at 150ms before fetching.
- [ ] Results are grouped under `Competitions`, `Teams`, `Players` caption headers.
- [ ] Each result row shows Crest (competitions/teams) or PlayerAvatar (players) at 28px + name + context line.
- [ ] Competition context shows type (e.g. "League"), team context shows country, player context shows "Position · Team".
- [ ] Click on a result navigates to the detail page and closes the overlay.
- [ ] Esc key closes the overlay.
- [ ] Clicking the backdrop closes the overlay.
- [ ] Empty state shows "No results for ..." when query matches nothing.
- [ ] Touch targets are ≥ 36×36px (result rows are min-height 44px).
- [ ] Focus ring is visible when tabbing through results.
- [ ] Screen reader live region announces result count.
- [ ] Mobile: overlay fills the full screen.
- [ ] Desktop: overlay is a centered modal with `max-w-lg`.
- [ ] Browser Network tab shows zero requests to `football-data.org`.
- [ ] `buildSearchIndex()` is called at the end of ingestion sync.

