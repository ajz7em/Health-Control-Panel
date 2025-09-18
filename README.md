# Health Control Panel — Weight Module

This repository now includes a weight-tracking experience implemented in the
`apps/web` Next.js application. It supports a browser-local demo mode or a
Prisma-backed database mode, exposes a stable HTTP API, and renders a
React-based form + chart workflow so you can trial the feature locally and in
Vercel preview deployments.

## Getting started

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000> to load the dashboard.

### Environment variables

| Variable                 | Description                                                                           | Default |
| ------------------------ | ------------------------------------------------------------------------------------- | ------- |
| `NEXT_PUBLIC_DEMO_MODE`  | `1` stores data in browser `localStorage`; `0` routes through the Prisma store / API. | `1`     |
| `DATABASE_URL`           | Prisma connection string (SQLite by default).                                         | -       |
| `TZ`                     | Optional. Set to `America/New_York` so server logs and previews match the UI.        | -       |

Create a `.env.local` file in `apps/web` when you need to override the defaults.

### Demo mode (default)

With `NEXT_PUBLIC_DEMO_MODE=1` the UI reads and writes weight entries directly
from `localStorage` while still exercising the same validation logic used by the
API. Each browser keeps an independent dataset, making it perfect for Vercel
preview deployments.

### Database mode

Switch `NEXT_PUBLIC_DEMO_MODE` to `0` and provide `DATABASE_URL` to persist data
in SQLite (local dev) or your production database. Initialise the schema via:

```bash
export NEXT_PUBLIC_DEMO_MODE=0
export DATABASE_URL="file:./dev.db"
cd apps/web
pnpm prisma migrate dev --name init_weight
cd ../..
```

The API and UI continue to function without code changes.

## API surface

All APIs live under `/api/weights` inside the Next.js App Router.

- `POST /api/weights` — Create a weight entry. The server computes local
  timestamps for "now" entries and validates payloads with Zod before saving.
- `GET /api/weights` — Return the canonical `WeightEntry[]` sorted by date and
  time.
- `DELETE /api/weights/:id` — Remove an entry (used by the recent entries table).

All responses share the same shape so the UI and any future client stay aligned.

## Front-end features

- **Weight form** — Capture weights in KG or LB, toggle "Now" vs "Backfill" and
  rely on Zod-powered inline errors.
- **Recent entries** — Show the last five readings with delete controls.
- **Recharts line chart** — Visualise the trend with an interactive unit toggle
  that never mutates stored data.
- **Time handling** — Automatically records "now" entries in
  `America/New_York`, keeps backfilled entries date-only, and stores `createdAt`
  in UTC.

## Deploying to Vercel

1. Connect the GitHub repository to Vercel.
2. Set the project root to `apps/web` when prompted.
3. Provide the following environment variables:
   - Preview: `NEXT_PUBLIC_DEMO_MODE=1` (no external database required)
   - Production (initially): `NEXT_PUBLIC_DEMO_MODE=1`
   - When ready for DB mode: add `DATABASE_URL` and flip
     `NEXT_PUBLIC_DEMO_MODE=0`
4. Keep the default Next.js build command. Vercel will expose a unique preview
   URL for every pull request.

The included `vercel.json` pins the Node.js runtime to 20.x for the API routes.

## Testing

Useful project commands:

```bash
pnpm lint
pnpm --filter web test
pnpm --filter web test:e2e
```

Run them after making changes to catch regressions before pushing to Vercel.
