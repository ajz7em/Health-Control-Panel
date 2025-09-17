# Changelog

## [0.2.0] - 2024-03-28

### Added
- Node 20 toolchain hints via `.nvmrc` plus repository-wide EditorConfig guidance.
- Baseline Prisma schema, migrations, and seed script for nutrition tracking data.
- Healthcheck API route, domain calculators, validation schemas, and unit tests.

### Changed
- Updated documentation with quick-start instructions and an aligned roadmap.
- Simplified CI expectations and workspace TypeScript configuration references.

## [0.1.3] - 2025-09-17

### Fixed
- Upgrade Playwright to version 1.55 so browser provisioning succeeds on
  Ubuntu 24.04 runners that provide `libasound2t64`, `libffi8`, and other
  updated packages, allowing the CI step that runs `playwright install
  --with-deps` to complete.

## [0.1.2] - 2024-03-27

### Fixed
- Ensure workspace unit tests exit cleanly by running Vitest in single-run mode,
  allowing empty test suites during early scaffolding.

## [0.1.1] - 2025-09-17

### Fixed
- Commit pnpm lockfile and adjust lint configuration so CI can install dependencies
  and run linting successfully.

## [0.1.0] - 2024-03-27

### Added
- Initial monorepo scaffold with Next.js app, shared package workspaces, and CI
  pipeline configuration.
