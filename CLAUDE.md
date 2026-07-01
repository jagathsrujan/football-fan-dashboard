# CLAUDE.md — Agent operating guide for the Football Fan Dashboard

## The five rules that never bend

1. **Every dependency must have a genuine, uncapped-in-time free tier.** Before adding any package, SDK, or third-party service, check it against `/docs/06-DEPLOYMENT.md#free-tier-budget`. If it's not on that list, don't add it without flagging it to the human first.
2. **Pages never call `football-data.org` directly.** All external API calls happen in the ingestion job (`/lib/ingestion`) or a `CRON_SECRET`-protected route. Every page and component reads from Postgres via Prisma or the Upstash cache.
3. **Mirror, don't invent.** Before building a new page or component, find the closest existing one and follow its data-fetching, loading, empty, and error pattern exactly. New patterns get added to `/docs/04-DESIGN-SYSTEM.md` before use.
4. **One phase or one feature per session.** Don't span Phase 3 and Phase 4 work in the same set of edits. Commit at a phase or feature boundary.
5. **Every color, font, spacing, and radius value traces to a token in `/lib/design-tokens.ts`.** No one-off hex codes or arbitrary Tailwind values in components.
