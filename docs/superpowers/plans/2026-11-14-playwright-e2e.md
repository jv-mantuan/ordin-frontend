# Playwright E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Browser e2e suite for `ordin-frontend` against its own NestJS API instance, with a dev-only auth bypass that cannot ship.

**Architecture:** Playwright `webServer` starts (1) the API compiled to a cache dir on port 3100 against local Postgres `ordin_e2e` with `AUTH_USE_NEON=false`, (2) Vite on 5174 with `VITE_AUTH_BYPASS=true`. The app's bypass reads a fake session from `localStorage`, seeded by a Playwright fixture. Two projects: mobile 375×812, desktop 1440×900. Optional `real-auth` project reuses a hand-saved `storageState` against the normal dev servers.

**Tech Stack:** `@playwright/test` (latest), Vite 8, React 19, pnpm; backend NestJS 12 + Prisma 7 (npm).

**Spec:** `docs/superpowers/specs/2026-11-14-playwright-e2e-design.md`

## Global Constraints

- Never touch `ordin-backend-node/dist`, `tsconfig.build.tsbuildinfo` or any backend tracked file (a dev server may be running in watch mode on 3000).
- The e2e API must only ever connect to `localhost`/`127.0.0.1`; database name `ordin_e2e`.
- Ports: API 3100, Vite 5174. Never kill or reuse 3000 / 5173 for the default suite.
- `AuthProvider.tsx` and `lib/auth.ts` edits (Task 4) wait until the profile-page WIP is committed in `ordin-frontend`.
- No password is ever typed by a script Claude runs; `e2e/.auth/` is gitignored.
- Commits only with the owner's OK; no `Co-Authored-By` line.
- UI copy/selectors are pt-BR; prefer role/label/text selectors over new `data-testid`s.

## Review Focus

1. `VITE_AUTH_BYPASS=true` left in `.env.local` / CI env during `pnpm build` — build must fail, not ship a bypass (Task 2 guard test).
2. Bypass on but no seeded session — app must treat it as signed out and redirect to `/login`, not crash (Task 5 `auth.spec.ts`).
3. `ordin-backend-node/env/test.env` edited to point at a remote host — `start-api.mjs` must refuse to start (Task 1 check).
4. Mobile and desktop projects running in parallel creating same-named categories/transactions — names must be unique per test (Task 3 `uniqueName`).
5. Sign-out under bypass followed by reload — must stay signed out (Task 5 `auth.spec.ts`).

---

### Task 1: Playwright install, e2e API starter, config

**Files:**
- Modify: `package.json` (devDependency `@playwright/test`; scripts `test:e2e`, `test:e2e:real`, `test:e2e:ui`)
- Modify: `.gitignore` (`/test-results/`, `/playwright-report/`, `/e2e/.auth/`, `/blob-report/`)
- Create: `e2e/start-api.mjs`
- Create: `playwright.config.ts`
- Create: `tsconfig.e2e.json` (+ reference in `tsconfig.json`) so `e2e/` and the config type-check without joining `tsconfig.app.json`

**Interfaces:**
- Produces: `node e2e/start-api.mjs` — long-running; exits non-zero before touching any DB if the derived host is not local.
- Produces: projects `mobile` (375×812, `isMobile`, `hasTouch`), `desktop` (1440×900), `real-auth`; `baseURL` `http://localhost:5174` for the first two.

- [ ] **Step 1:** `pnpm add -D @playwright/test` then `pnpm exec playwright install chromium`.
- [ ] **Step 2: `e2e/start-api.mjs`.** Resolve backend dir `../ordin-backend-node`. Parse `env/test.env` with `node:util` `parseEnv`. Replace the database path of `DATABASE_URL` and `DIRECT_URL` with `/ordin_e2e`; if `new URL(...).hostname` is not `localhost`/`127.0.0.1`, print `Refusing to run e2e API against non-local database host <host>` and `process.exit(1)`. Then, using `pg` resolved from the backend (`createRequire`): create `ordin_e2e` if missing (connect to `postgres` DB); `npx prisma migrate deploy` (cwd backend, env = derived vars); apply `test/sql/neon-auth.sql`; `TRUNCATE transactions, categories, users, neon_auth.account, neon_auth."user" CASCADE`. Compile: `npx tsc -p tsconfig.build.json --outDir node_modules/.cache/ordin-e2e-ui --tsBuildInfoFile node_modules/.cache/ordin-e2e-ui.tsbuildinfo` (cwd backend), write `{"type":"module"}` to that outDir's `package.json`, then spawn `node node_modules/.cache/ordin-e2e-ui/main.js` with env `{...process.env, ...derived, NODE_ENV:'test', AUTH_USE_NEON:'false', PORT:'3100', CORS_ORIGINS:''}`, inherit stdio, forward SIGINT/SIGTERM.
- [ ] **Step 3: Verify the host check.** The script takes an optional `--env-file <path>` (default `<backend>/env/test.env`). Write a temp env file with `DATABASE_URL=postgresql://u:p@db.example.com:5432/x` and run `node e2e/start-api.mjs --env-file <tmp>`. Expected: exit 1 with the refusal message, no DB connection.
- [ ] **Step 4: Verify the API starts.** `node e2e/start-api.mjs` then `curl -s http://localhost:3100/v1/categories` → 200 with `{ data: [...], metadata }`. Stop it.
- [ ] **Step 5: `playwright.config.ts`.** `testDir: 'e2e'`, `fullyParallel: true`, `retries: process.env.CI ? 2 : 0`, `trace: 'retain-on-failure'`. `webServer` array: API (`node e2e/start-api.mjs`, `url: 'http://localhost:3100/v1/categories'`, timeout 180 s) and web (`pnpm exec vite --port 5174 --strictPort`, env `VITE_API_URL=http://localhost:3100`, `VITE_AUTH_BYPASS=true`, `VITE_NEON_AUTH_URL=https://neon-auth.invalid/neondb/auth`), both `reuseExistingServer: !process.env.CI`. `real-auth` project: `testMatch: /real-auth\/.*\.spec\.ts/`, `baseURL http://localhost:5173`, `storageState: 'e2e/.auth/real-user.json'`; `mobile`/`desktop` use `testIgnore` for that folder. When `PW_REAL_AUTH` is set (script `test:e2e:real`), skip the `webServer` entries and run only `real-auth`.
- [ ] **Step 6:** `pnpm exec playwright test --list` lists no errors.

### Task 2: Bypass module + production build guard

**Files:**
- Create: `src/lib/authBypass.ts`
- Modify: `src/vite-env.d.ts` (or create) — `VITE_AUTH_BYPASS?: string`
- Modify: `vite.config.ts` — build guard
- Create: `scripts/auth-bypass-guard.test.mjs` (`node:test`)
- Modify: `package.json` script `test:bypass-guard`: `node --test scripts/auth-bypass-guard.test.mjs`

**Interfaces:**
- Produces (from `src/lib/authBypass.ts`):
  - `export const AUTH_BYPASS: boolean` = `import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === 'true'`
  - `export const BYPASS_TOKEN = 'ordin-e2e-bypass-token'` (also the marker the guard greps for)
  - `export const BYPASS_SESSION_KEY = 'ordin.e2e.session'`
  - `export function readBypassSession(): AuthSession | null` (parse `localStorage`, null on missing/invalid)
  - `export function writeBypassSession(s: AuthSession | null): void` (null removes the key)

- [ ] **Step 1: Failing guard test** `scripts/auth-bypass-guard.test.mjs`:
  - `test('build fails when VITE_AUTH_BYPASS=true')` — `spawnSync('pnpm', ['exec','vite','build','--outDir', tmpA], { env: {...process.env, VITE_AUTH_BYPASS:'true'}, shell:true })`; assert `status !== 0` and output includes `VITE_AUTH_BYPASS`.
  - `test('production bundle has no bypass code')` — normal `vite build --outDir tmpB`; assert status 0 and no file in `tmpB` contains `ordin-e2e-bypass-token` or `ordin.e2e.session`.
- [ ] **Step 2:** `pnpm test:bypass-guard` → first test FAILS (build succeeds).
- [ ] **Step 3:** In `vite.config.ts` use the function form `defineConfig(({ command, mode }) => …)`; when `command === 'build'` and `loadEnv(mode, process.cwd(), '').VITE_AUTH_BYPASS === 'true'` (process env included), throw `VITE_AUTH_BYPASS=true is not allowed in a build (dev-only e2e auth bypass).`
- [ ] **Step 4:** Create `src/lib/authBypass.ts` (not yet imported anywhere).
- [ ] **Step 5:** `pnpm test:bypass-guard` → both PASS. Re-run after Task 4 (the second test only means something once the module is imported).

### Task 3: Playwright fixtures + specs

**Files:**
- Create: `e2e/fixtures.ts`
- Create: `e2e/auth.spec.ts`, `e2e/dashboard.spec.ts`, `e2e/categories.spec.ts`, `e2e/transactions.spec.ts`, `e2e/profile.spec.ts`
- Create: `e2e/real-auth/smoke.spec.ts`

**Interfaces:**
- Consumes: `BYPASS_SESSION_KEY` value `'ordin.e2e.session'` (duplicated as a string literal in fixtures; e2e must not import app modules that touch `import.meta.env`).
- Produces (from `e2e/fixtures.ts`): `test` extending `@playwright/test` with fixture `signedIn` (auto: false) that `addInitScript`s `localStorage.setItem('ordin.e2e.session', JSON.stringify({ user: { id: '902d93b1-1ef8-4cc2-adbb-a6ba80144587', email: 'master@master.com', name: 'Master E2E', emailVerified: true } }))`; `export function uniqueName(testInfo: TestInfo, prefix: string): string` → `${prefix} ${testInfo.project.name} ${Date.now().toString(36)}${testInfo.workerIndex}`; re-export `expect`.

Read each page (`src/pages/*/index.tsx`, `CategoryTable`, `TransactionTable`, `CategoryPanel`, `BottomNav`, `Sidebar`) for real labels before writing selectors; mobile layouts differ (cards / bottom sheets / `BottomNav`).

- [ ] **Step 1: Specs.**
  - `auth.spec.ts`: `signed out → /perfil redirects to /login`; `sign out from signed-in state → /login, and reload stays on /login`.
  - `dashboard.spec.ts`: signed in, `/` shows the `Dashboard` top bar heading and no error toast; mobile shows `BottomNav`, desktop shows the sidebar.
  - `categories.spec.ts`: create (name via `uniqueName`) → visible; edit to new unique name → visible, old gone; delete (accept confirm if any) → gone.
  - `transactions.spec.ts`: create a category via API `request.post('http://localhost:3100/v1/categories', …)` in `beforeEach`; create transaction (Descrição unique, Valor `12,34`, Tipo, Data, Categoria) → row/card shows description and `12,34`; edit description → updated; delete → gone.
  - `profile.spec.ts`: `/perfil` → change `Nome` to unique value → save → success feedback, and TopBar/Sidebar user name shows the new value after reload.
  - `real-auth/smoke.spec.ts`: `test.skip(!existsSync('e2e/.auth/real-user.json'), 'run codegen --save-storage first')`; `/` is not redirected to `/login` and a dashboard heading is visible. Read-only.
- [ ] **Step 2:** `pnpm test:e2e --project=desktop`. Before Task 4 the app still asks Neon (`neon-auth.invalid`), gets an error and treats it as signed out. Expected: signed-out redirect PASS, every signed-in spec FAIL by landing on `/login`. This is the red state Task 4 turns green.

### Task 4: Wire bypass into the app (after profile WIP is committed)

**Files:**
- Modify: `src/lib/auth.ts` — top of `getAccessToken`
- Modify: `src/context/AuthProvider.tsx` — `readSession`, `signOut`, `updateName`

**Interfaces:**
- Consumes: Task 2 `authBypass.ts` exports.

- [ ] **Step 1:** Confirm `git status` shows `AuthProvider.tsx` and `lib/auth.ts` clean (WIP committed). If not, stop and report.
- [ ] **Step 2:** `getAccessToken`: `if (AUTH_BYPASS) return readBypassSession() ? BYPASS_TOKEN : null`.
- [ ] **Step 3:** `readSession`: `if (AUTH_BYPASS) return readBypassSession()` before any SDK call. `signOut`: under bypass call `writeBypassSession(null)` instead of `authClient.signOut()` (keep cache clear + `setSession(null)`). `updateName`: under bypass write `{ user: { ...current, name: name.trim() } }` and `setSession`, return `{ error: null }`.
- [ ] **Step 4:** `pnpm build` (no flag) passes; `pnpm lint` passes; `pnpm test:bypass-guard` PASS (marker absent in prod bundle — if present, restructure so every use site is guarded by `import.meta.env.DEV` inline).
- [ ] **Step 5:** `pnpm test:e2e` → all specs PASS on `mobile` and `desktop`; `real-auth` skipped. Fix selectors, not assertions, on failure; any real app bug found is reported, not patched here.

### Task 5: Docs + handoff

**Files:**
- Modify: `AGENTS.md` — new `## E2E (Playwright)` section; add `pnpm test:e2e`, `test:e2e:real`, `test:e2e:ui`, `test:bypass-guard` to Commands
- Modify: root `D:/Projetos/Ordin/CLAUDE.md` line "No test projects exist" — only if owner agrees (not a git repo; mention in report instead)

- [ ] **Step 1:** Document: what the suite starts (ports 3100/5174, DB `ordin_e2e` from `env/test.env`, truncated each run), the bypass and its two guards, `localStorage` key, how to add a signed-in spec (`signedIn` fixture), how the owner saves a real session (`pnpm exec playwright codegen --save-storage=e2e/.auth/real-user.json http://localhost:5173/login`, needs dev servers on 3000/5173 with Neon auth), and that Claude never runs the codegen login.
- [ ] **Step 2:** Final run: `pnpm lint`, `pnpm build`, `pnpm test:bypass-guard`, `pnpm test:e2e`. Report results; ask owner before committing (message without `Co-Authored-By`).
