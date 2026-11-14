import { test as base, expect, type APIRequestContext, type TestInfo } from '@playwright/test'

/** The e2e API started by playwright.config.ts (auth bypass: any bearer token = master user). */
export const E2E_API_URL = 'http://localhost:3100'

/** Must match BYPASS_SESSION_KEY in src/lib/authBypass.ts (e2e code does not import app modules). */
const BYPASS_SESSION_KEY = 'ordin.e2e.session'
const SEEDED_FLAG = 'ordin.e2e.seeded'

export const E2E_USER = {
  id: '902d93b1-1ef8-4cc2-adbb-a6ba80144587',
  email: 'master@master.com',
  name: 'Master E2E',
  emailVerified: true,
}

export const test = base.extend<{ signedIn: boolean; seedSession: void }>({
  /** Tests start signed in; `test.use({ signedIn: false })` starts signed out. */
  signedIn: [true, { option: true }],
  /**
   * Seeds the fake session once per tab, so reloads keep whatever the app wrote since
   * (a new name, or no session after "Sair").
   */
  seedSession: [
    async ({ page, signedIn }, use) => {
      if (signedIn) {
        await page.addInitScript(
          ({ key, flag, user }) => {
            if (sessionStorage.getItem(flag)) return
            sessionStorage.setItem(flag, '1')
            localStorage.setItem(key, JSON.stringify({ user }))
          },
          { key: BYPASS_SESSION_KEY, flag: SEEDED_FLAG, user: E2E_USER },
        )
      }
      await use()
    },
    { auto: true },
  ],
})

export { expect }

/** A name no other test, worker or project (mobile/desktop) will use in this run. */
export function uniqueName(testInfo: TestInfo, prefix: string): string {
  const suffix = `${Date.now().toString(36)}${testInfo.workerIndex}${testInfo.retry}`
  return `${prefix} ${testInfo.project.name} ${suffix}`
}

/** Creates a category straight through the API (setup for specs that are not about categories). */
export async function createCategoryViaApi(request: APIRequestContext, name: string): Promise<{ id: string; name: string }> {
  const res = await request.post(`${E2E_API_URL}/v1/categories`, {
    headers: { Authorization: 'Bearer e2e' },
    data: { name },
  })
  expect(res.ok(), await res.text()).toBeTruthy()
  return (await res.json()).data
}
