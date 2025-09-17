# Health Control Panel

A pnpm-powered monorepo that hosts the Health Control Panel web application, core
calculation utilities, validation schemas, and infrastructure tooling. The goal
is to provide a reproducible foundation for tracking nutrition and body
composition metrics.

## Project layout

- `apps/web` – Next.js 14 App Router project with Tailwind CSS, Playwright, and
  Vitest.
- `packages/core` – TypeScript utilities for metabolic and nutrition
  calculations.
- `packages/validation` – Zod schemas for onboarding flows and daily data
  entries.
- `packages/infra` – Prisma schema, migrations, and database helpers.
- `packages/test` – Shared testing helpers built on Testing Library.

## Quick start

1. Install Node.js 20 using `.nvmrc` (e.g. `nvm use`).
2. Install dependencies with `pnpm install`.
3. Generate the Prisma client and apply migrations:

   ```bash
   pnpm --filter @hcp/infra prisma:generate
   pnpm --filter @hcp/infra prisma:migrate
   ```

4. Run the development server:

   ```bash
   pnpm dev
   ```

5. Execute quality checks:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

## Environment variables

Copy `.env.example` to `.env` and provide real values for production secrets.
The default configuration uses SQLite for local development and exposes
placeholders for future integrations.
