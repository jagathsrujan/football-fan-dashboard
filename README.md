# Football Fan Dashboard

> An enterprise-grade, matchday operations surface for football fans built with Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Prisma 6, PostgreSQL, Upstash Redis REST, Better Auth, and Framer Motion.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38BDF8)](https://tailwindcss.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-OAuth-16A34A)](https://better-auth.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Live Demo & Template

- **Live Demo**: [https://football-fan-dashboard.vercel.app](https://football-fan-dashboard.vercel.app) *(or configure on your own Vercel deployment)*
- **Template Repository**: Click **Use this template** at the top of this repository on GitHub to immediately generate a fresh repository with this stack and folder structure!

---

## ✨ Features & Matchday Experience

- **⚡ Fast & Dense Matchday UI**: Designed with Oswald display typography, Inter body text, and IBM Plex Mono tabular numbers for scores and statistics.
- **🛡️ Cache-Aside Data Layer**: Upstash Redis REST caching wrapper backed by Prisma/PostgreSQL. Protects third-party API limits while serving instant page loads.
- **🔄 Live-Feeling Polling**: TanStack Query polling against internal endpoints every 30 seconds for matches `IN_PLAY` or within 15 minutes of kickoff. Automatically stops when `FINISHED`.
- **🎉 Goal Toasts & Split-Flap Scoreboard**: Event-driven goal notifications slide in from the top right holding for 4s without visual clutter. 3D vertical roll digit transitions with amber background flash when scores change.
- **⭐ Personalized Favorites**: Better Auth integration with GitHub OAuth. Star teams and players to unlock a personalized "Your Teams — This Week" hero dashboard on the home page.
- **🔍 Global ⌘K Search**: Instant debounced in-memory overlay search across competitions, teams, and players.
- **♿ Fully Accessible & Responsive**: Visible focus rings (`accent-primary 40%`), 36×36px mobile touch targets, sticky horizontal scrolling tables, and full `prefers-reduced-motion` compliance.

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------------+
|                              CLIENT LAYER                               |
|   App Shell (Sidebar / Mobile Tabs / Topbar) + ⌘K Global Search        |
|   Pages: Home | Competitions | Teams | Players | Matches | Favorites   |
+-------------------------------------------------------------------------+
                                    |
                                    v (Internal Fetch / TanStack Query)
+-------------------------------------------------------------------------+
|                           API & CACHE LAYER                             |
|   Next.js App Router API Routes (/api/competitions, /api/matches, etc.) |
|   Upstash Redis REST Wrapper (Cache-Aside with TTLs & Key Governance)   |
+-------------------------------------------------------------------------+
                                    |
                    +---------------+---------------+
                    | (Cache Miss)                  | (Scheduled Cron)
                    v                               v
+-----------------------------------+   +---------------------------------+
|          DATABASE LAYER           |   |       INGESTION PIPELINE        |
|   PostgreSQL Database             |   |   Rate-Limited Fetcher          |
|   Prisma 6 Domain Schema          |   |   football-data.org v4 API      |
|   User/Auth/Favorites Models      |   |   Idempotent Upsert Mappers     |
+-----------------------------------+   +---------------------------------+
```

```mermaid
flowchart LR
  FD["football-data.org v4"] -->|"cron only, 10 req/min safe"| ING["Ingestion pipeline"]
  ING --> DB[("Postgres via Prisma")]
  ING -->|"invalidate touched keys"| REDIS[("Upstash Redis")]
  REDIS --> API["Next.js API routes"]
  DB --> API
  API --> UI["App Router pages + client tabs"]
  UI --> FAN["Fan dashboard experience"]
```

---

## ⏱️ 15-Minute Fork-to-Running Guide

You can run this application entirely locally with realistic football data without needing external API keys for `football-data.org` or Upstash Redis!

### 1. Clone & Install
```bash
git clone https://github.com/jagathsrujan/football-fan-dashboard.git
cd football-fan-dashboard
npm install
```

### 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and set your PostgreSQL database connection string:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/football_dashboard?schema=public"
AUTH_SECRET="your-random-secret-key-for-better-auth"
```

### 3. Run Migrations & Standalone Seed
Push the database schema and execute our standalone seed script:
```bash
npx prisma migrate dev
npx prisma db seed
```
> 🌱 The seed script generates realistic data for Premier League and Champions League, 8 top clubs (Arsenal, Man City, Liverpool, Real Madrid, etc.), 12 star players, upcoming and finished matches with goal events, and accurate standings—**zero external API calls required**.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You can immediately browse competitions, teams, players, match details, and test search and live-polling features!

---

## 🧪 Testing & Verification Suite

Our repository includes comprehensive code quality checks, unit tests, and smoke tests:

```bash
# Code Linting & Type Checking
npm run lint
npx tsc --noEmit

# Unit Tests (Vitest — tests zone computation & standings logic)
npm run test
npm run test:watch

# End-to-End Smoke Tests (Playwright — tests Home and Competition routing)
npm run test:e2e
```

Continuous Integration is provided via GitHub Actions template (`.github/workflows-template/ci.yml`), which spins up a Postgres service container, runs database migrations and seeding, executes Vitest unit tests, builds the Next.js production bundle, and runs Playwright smoke tests. To activate CI on your fork, copy `.github/workflows-template/ci.yml` to `.github/workflows/ci.yml`.

---

## 📁 Repository Structure

| Area | Directories / Files | Description |
| --- | --- | --- |
| **App Routes** | `app/**/page.tsx`, `app/api/**/route.ts` | Server-rendered pages and internal REST API endpoints. |
| **App Shell** | `components/layout/app-shell.tsx` | Responsive sidebar, topbar, mobile bottom navigation, and theme toggles. |
| **UI Primitives** | `components/ui/*` | Shared, tokenized UI components (Cards, Badges, Tables, Skeleton, Tabs, Sheets). |
| **Football Compositions** | `components/football/*` | Domain-specific components (Crests, Player Avatars, Match Cards, Standings Table, Form Guide, Score Display). |
| **Feature Clients** | `components/competitions/*`, `teams/*`, `players/*`, `matches/*`, `schedule/*` | Interactive client features and TanStack Query polling integrations. |
| **Query & Cache** | `lib/queries/*`, `lib/cache.ts` | Database query functions and Upstash Redis cache-aside wrapper. |
| **Auth & Favorites** | `lib/auth.ts`, `lib/auth-client.ts`, `hooks/use-favorites.ts` | Better Auth server/client configuration and user favorites hooks. |
| **Ingestion Pipeline** | `lib/football-data-client.ts`, `lib/ingestion/*` | Rate-limited external client and idempotent Postgres upsert mappers. |
| **Database & Seed** | `prisma/schema.prisma`, `prisma/seed.ts` | Domain data models and standalone realistic seeding script. |
| **Governance Docs** | `docs/CLAUDE.md`, `PROJECT-HANDOFF.md`, `qa-checklists.md` | Immutable architecture rules, continuity guide, and QA checklists. |

---

## 📜 Contributing & License

Please review [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/PROJECT-HANDOFF.md](docs/PROJECT-HANDOFF.md) before submitting pull requests.

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.
