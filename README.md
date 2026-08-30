# Sofia Round Table conference site

Replacement for [sofia-round-table.narodnichitalishta.bg](https://sofia-round-table.narodnichitalishta.bg/). One scrolling public page in Bulgarian (`/`) and English (`/en`), with an authenticated admin panel.

Hosting decision: Vercel Hobby. See `docs/hosting-decision.md`. Do not change SiteGround DNS until production deployment, backups, and rollback are complete.

## Requirements

- Node.js 20.9 or later (22.x is the intended Vercel runtime; see `.nvmrc`)
- npm 10 or later (this repository sets `engine-strict=true`)

If `npm install` fails with an engines error, an old npm is on your `PATH`.

**Windows / Nodist:** Node 22 is fine; Nodist is still serving npm 6.9.0, which cannot install this project. Official Node.js is already installed at `C:\Program Files\nodejs\` with npm 11.

In the current PowerShell terminal:

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
node -v
npm -v
npm install
```

You want `npm` 10 or 11, not 6.9.0. Then open a **new** terminal in Cursor (this repo prepends official Node.js via `.vscode/settings.json`).

Do not lower the npm engine requirement. Next.js 16 does not work with npm 6.

## Setup

1. Clone the repository.
2. Copy `.env.example` to `.env.local` and fill in values when they exist. Do not commit `.env.local`.
3. Install dependencies:

```bash
npm ci
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for Bulgarian and [http://localhost:3000/en](http://localhost:3000/en) for English.

## Scripts

| Script                 | Purpose                                     |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Next.js development server                  |
| `npm run build`        | Production build                            |
| `npm run start`        | Serve the production build                  |
| `npm run lint`         | ESLint                                      |
| `npm run format`       | Prettier write                              |
| `npm run format:check` | Prettier check (CI)                         |
| `npm run typecheck`    | Generate Next.js types, then `tsc --noEmit` |
| `npm run test`         | Vitest unit tests                           |
| `npm run test:e2e`     | Playwright browser tests                    |
| `npm run db:generate`  | Generate Drizzle SQL migrations             |
| `npm run db:migrate`   | Apply reviewed migrations to `DATABASE_URL` |
| `npm run db:seed`      | Idempotent content seed (Phase 5)           |
| `npm run admin:create` | Create an administrator locally (Phase 3)   |

## Database migrations

Production schema changes live in committed SQL files under `drizzle/`. Generate them with `npm run db:generate`, review the SQL, apply to the development Neon branch with `npm run db:migrate`, then apply the same reviewed files to production during deployment. Do not use schema push against production.

Neon Free-plan limits and scale-to-zero behavior are documented in `docs/operations.md`.

## Seeding

`npm run db:seed` will load approved Bulgarian and English copy plus the Word schedule. Running it twice must not duplicate records. Implemented in Phase 5.

## Creating administrators

There is no public registration. After Phase 3, run `npm run admin:create` locally. It will prompt for email, display name, and password. Confirmed accounts:

- Emilian Kadiyski — `e.kadiyski@gmail.com`
- Maria Getova — `maria.getova@narodnichitalishta.bg`
- Yuriy Vulkovsky — `yuriy.vulkovsky@narodnichitalishta.bg`

## Testing

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Playwright (install browsers once with `npx playwright install chromium`):

```bash
npm run test:e2e
```

CI runs lint, format check, typecheck, unit tests, and the production build on each pull request and on `main`.

## Deployment

1. Connect this Git repository to a Vercel Hobby project.
2. Set the Node.js version to 22.x in Vercel project settings.
3. Protect the `main` branch from accidental force pushes in GitHub.
4. Configure Preview and Production environment variables separately. Names are listed in `.env.example`. Never put secrets in `NEXT_PUBLIC_*` variables.
5. Deploy a preview first. Apply reviewed production migrations, seed once, and create the first production administrator before DNS cutover.
6. Production custom domain: `sofia-round-table.narodnichitalishta.bg`. Copy the exact CNAME from Vercel; do not guess it.

Details: `docs/hosting-decision.md` and implementation plan Phase 13.

## Rollback

Until DNS cutover, roll back by reverting the Git deployment on Vercel. After DNS cutover, restore the recorded SiteGround DNS value for `sofia-round-table` so the WordPress site answers again. Keep WordPress and its backup intact during the rollback window. Do not delete Neon, Blob, or Vercel resources while investigating.

The old DNS target is not yet recorded. Capture it in a private launch runbook before changing SiteGround DNS.

## Repository layout

Application code lives under `src/` as in the implementation plan. Deliberate Phase 1 notes:

- Admin and API routes are directory placeholders only. They are not wired until authentication and Blob upload exist.
- `db:*` and `admin:create` scripts exist but exit until Phases 2, 3, and 5.
- Brand files in `public/brand/` are development copies. Production images will be served from Vercel Blob.
- Wix Madefor fonts are not self-hosted yet (Phase 6).
- `html lang` is set from the request path via `src/proxy.ts` (`/` = `bg`, `/en` = `en`).
