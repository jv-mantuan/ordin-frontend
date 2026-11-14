import { defineConfig, devices } from '@playwright/test'

/**
 * E2E suite (pnpm test:e2e). Playwright starts its own servers so it never touches the dev ones
 * (API 3000 / Vite 5173) or the Neon databases:
 *  - API on 3100 against local Postgres `ordin_e2e`, auth bypass (every request = master user);
 *  - Vite on 5391 with the dev-only VITE_AUTH_BYPASS (see src/lib/authBypass.ts).
 * The real-login smoke test has its own config: playwright.real-auth.config.ts.
 */
const E2E_API_URL = 'http://localhost:3100'
// Not 5174: Vite falls back to it when 5173 is busy, and a plain dev server there has no bypass.
const E2E_WEB_URL = 'http://localhost:5391'

export default defineConfig({
  testDir: 'e2e',
  testIgnore: /real-auth[\\/]/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: E2E_WEB_URL,
    trace: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: [
    {
      command: 'node e2e/start-api.mjs',
      url: `${E2E_API_URL}/v1/categories`,
      timeout: 180_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm exec vite --port 5391 --strictPort',
      url: E2E_WEB_URL,
      timeout: 60_000,
      // Starts in ~1 s; never reuse a stray server that may lack the bypass env.
      reuseExistingServer: false,
      env: {
        VITE_API_URL: E2E_API_URL,
        VITE_AUTH_BYPASS: 'true',
        // Never contacted while the bypass is on; lib/auth.ts only requires it to be set.
        VITE_NEON_AUTH_URL: 'https://neon-auth.invalid/neondb/auth',
      },
    },
  ],
})
