# Contributing to Football Fan Dashboard

Thank you for your interest in contributing to the **Football Fan Dashboard**! This project is designed as an enterprise-grade, matchday operations surface for football fans built with Next.js 15 App Router, TypeScript, Tailwind CSS, and Prisma 6.

## Getting Started

Before contributing code or architecture changes, please familiarize yourself with our project documentation and rules:

1. **[docs/CLAUDE.md](file:///Users/agent/Documents/football%20project%201/docs/CLAUDE.md)** — **Critical Rules**: Read the five immutable project architecture rules (e.g., never calling `football-data.org` from UI/pages, maintaining cache-aside patterns, ensuring loading/empty/error states).
2. **[docs/PROJECT-HANDOFF.md](file:///Users/agent/Documents/football%20project%201/docs/PROJECT-HANDOFF.md)** — **Continuity & Progress Guide**: Every AI agent or developer modifying the codebase must update this file in the same commit when changing behavior, architecture, data shape, or developer workflows.
3. **[docs/01-ARCHITECTURE.md](file:///Users/agent/Documents/football%20project%201/docs/01-ARCHITECTURE.md)** — Core system architecture, data flow, and database schema overview.
4. **[docs/qa-checklists.md](file:///Users/agent/Documents/football%20project%201/docs/qa-checklists.md)** — Manual QA expectations for data pages and features.

## Development Workflow

1. **Fork & Clone**: Fork this repository and clone your fork locally.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**: Copy `.env.example` to `.env` and set your local PostgreSQL database connection string (`DATABASE_URL`).
4. **Database Setup & Seeding**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```
   Our standalone seed script populates your local PostgreSQL database with realistic mock competitions, teams, players, matches, and standings—without requiring external API keys.
5. **Start Dev Server**:
   ```bash
   npm run dev
   ```

## Verification & Pull Requests

Before submitting a Pull Request, verify that your changes pass all code quality and testing standards:

```bash
# Code linting
npm run lint

# TypeScript compilation check
npx tsc --noEmit

# Vitest unit tests
npm run test

# Playwright smoke tests (requires build or running server)
npm run test:e2e
```

Please ensure your commit messages are clear, and update `docs/PROJECT-HANDOFF.md` with a summary of your changes.
