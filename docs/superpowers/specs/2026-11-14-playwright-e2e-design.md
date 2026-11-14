# Playwright E2E — design

## Intent

Browser end-to-end tests for `ordin-frontend` running against the real NestJS API (`ordin-backend-node`), runnable by the owner and by Claude without anyone typing a password into Neon Auth. Mobile-first app, so every spec runs at 375 px and at desktop width.

## Goals

- `pnpm test:e2e` starts its own API + Vite, runs the suite on a mobile (375×812) and a desktop project.
- Specs: signed-out redirect to `/login`; dashboard loads; category create/edit/delete; transaction create/edit/delete; profile `/perfil` rename.
- Auth bypass that cannot be enabled in a production build, with a check proving it.
- Optional real-login smoke test reusing a session the owner saved by hand.
- Docs in `AGENTS.md`.

## Non-goals / anti-goals

- No writes to the Neon dev or prod databases from the default suite.
- No step that types a password (Claude never runs one).
- No CI wiring yet; no visual-regression snapshots.
- Must not collide with dev servers already on ports 3000 / 5173, nor with the backend's vitest e2e database.

## Approaches considered

- **A — app flag `VITE_AUTH_BYPASS` (chosen by owner).** `AuthProvider` exposes a fake signed-in session and `getAccessToken` returns a dummy token the API accepts in bypass mode. Stable across `@neon/auth` upgrades; costs a guarded code path in the app and edits to `AuthProvider.tsx` / `lib/auth.ts`.
- B — intercept Neon Auth's `GET /get-session` in Playwright (fake session + `set-auth-jwt` header). Zero app code, but couples tests to the SDK's wire format. Not chosen.

## Design

### Auth bypass (app)

- New `src/lib/authBypass.ts`: `export const AUTH_BYPASS = import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true'`, plus helpers to read/write a fake session in `localStorage` (`ordin.e2e.session`).
- `lib/auth.ts`: `getAccessToken` returns a fixed dummy token when `AUTH_BYPASS` (API in bypass treats every request as the master user).
- `AuthProvider.tsx`: when `AUTH_BYPASS`, `readSession` reads the fake session from `localStorage` (none = signed out, so the redirect spec works), `signOut` clears it, `updateName` rewrites it. Other actions untouched.
- Playwright seeds the fake session with `addInitScript` for signed-in specs.
- **Production guard, two layers:** (1) `vite.config.ts` throws when `command === 'build'` and `VITE_AUTH_BYPASS=true`; (2) `pnpm test:bypass-guard` builds normally and fails if the bypass marker string is in `dist/`, and checks that a build with the flag set fails.
- These two files carry uncommitted profile-page work from another session: the bypass edits wait until that work is committed.

### Servers (Playwright `webServer`)

- API: `e2e/start-api.mjs` derives a local `ordin_e2e` database URL from `ordin-backend-node/env/test.env`, creates the DB if missing, runs `prisma migrate deploy` + `test/sql/neon-auth.sql`, truncates app tables, then starts the API on **port 3100** with `NODE_ENV=test`, `AUTH_USE_NEON=false`. Env is passed explicitly (no `env/dev.env`), so it cannot reach Neon.
- Web: Vite on **port 5391** (not 5174, which is Vite's fallback when 5173 is busy; never reused) with `VITE_API_URL=http://localhost:3100`, `VITE_AUTH_BYPASS=true`, dummy `VITE_NEON_AUTH_URL` (process env wins over `.env.local`).
- `reuseExistingServer` only when not in CI.

### Specs (`e2e/`)

- Unique names per test (project + timestamp) so mobile/desktop and parallel workers don't collide; no assertions on global totals.
- Selectors by role / label / pt-BR text.

### Real-login smoke (optional)

- Owner runs once: `pnpm exec playwright codegen --save-storage=e2e/.auth/real-user.json http://localhost:5173/login` and logs in by hand. `e2e/.auth/` is gitignored.
- Project `real-auth` (script `pnpm test:e2e:real`) uses that storage state against the normal dev servers (5173 + 3000, Neon auth on); read-only (dashboard loads, user name shown); skipped when the file is missing.

## Left to the builder

- Exact selectors, spec file split, worker count, timeouts.
- Whether to add `data-testid`s where role/text selectors are ambiguous (prefer not).
