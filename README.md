# Health Control Panel

A monorepo for the Health Control Panel experience. The web application ships
with interchangeable weight-store backends so local development, previews, and
production can rely on the best storage option for each environment.

## Weight store strategy

`apps/web` resolves its persistence layer at runtime. The server factory lazily
loads the Prisma-backed store when Prisma is available, but it falls back to the
local-storage implementation in two situations:

- When the Edge runtime is active, because Prisma's Node driver is unavailable
  on Edge.
- When `WEIGHT_STORE_STRATEGY=local` is set, which is convenient for Vercel
  previews or any deployment where a database connection is not configured.

This behaviour lets production builds keep using Prisma while local demos and
preview deployments continue to function without a database. The local store is
scoped to each server instance, so values reset between deployments.

## Known limitations

- Demo mode persistence across Vercel previews not implemented — acceptable for
  now. If previews need stable data, add a client-side localStorage store or DB.
