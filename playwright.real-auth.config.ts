import { defineConfig, devices } from '@playwright/test'

/**
 * Optional read-only smoke test with a real Neon Auth session (pnpm test:e2e:real).
 * Runs against the normal dev servers (Vite 5173 + API 3000 with AUTH_USE_NEON=true), which you
 * start yourself. Save the session once, logging in by hand in the window that opens:
 *   pnpm exec playwright codegen --save-storage=e2e/.auth/real-user.json http://localhost:5173/login
 * e2e/.auth/ is gitignored. Neon sessions expire: re-run codegen when the test lands on /login.
 */
export default defineConfig({
  testDir: 'e2e/real-auth',
  retries: 0,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5173',
    storageState: 'e2e/.auth/real-user.json',
    trace: 'retain-on-failure',
    locale: 'pt-BR',
  },
})
