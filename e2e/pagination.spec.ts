import { E2E_API_URL, expect, test, uniqueName } from './fixtures'
import type { APIRequestContext, Page } from '@playwright/test'

/**
 * Runs in its own phase (see playwright.config.ts). Its mobile and desktop runs still share the master
 * user, so a run's rows may not be on the first page: tests only assert that the first page does not
 * hold all of them, and that scrolling eventually loads every one.
 */
const AUTH = { Authorization: 'Bearer e2e' }
const COUNT = 35

async function seed(request: APIRequestContext, path: string, rows: object[]) {
  for (const data of rows) {
    const res = await request.post(`${E2E_API_URL}${path}`, { headers: AUTH, data })
    expect(res.ok(), await res.text()).toBeTruthy()
  }
}

/** Scrolls to the end of the list until no "Carregar mais" remains or `done()` holds. */
async function scrollToEnd(page: Page, done: () => Promise<boolean>) {
  for (let i = 0; i < 20 && !(await done()); i++) {
    const more = page.getByRole('button', { name: 'Carregar mais' })
    if ((await more.count()) === 0) break
    await more.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
  }
}

test('Serviços loads the next page on scroll, and a filter starts a fresh list', async ({ page, request }, testInfo) => {
  const prefix = uniqueName(testInfo, 'Pag')
  const date = '2020-01-01'
  await seed(
    request,
    '/v1/services',
    Array.from({ length: COUNT }, (_, i) => ({ name: `${prefix} ${i}`, date, amount: 1, receivedAmount: 0, expenses: 0 })),
  )

  await page.goto('/servicos')
  const mine = page.getByText(new RegExp(`^${prefix} \\d+$`))
  await expect(page.getByRole('button', { name: 'Carregar mais' })).toBeVisible()
  expect(await mine.count()).toBeLessThan(COUNT)

  await scrollToEnd(page, async () => (await mine.count()) === COUNT)
  await expect(mine).toHaveCount(COUNT)

  // Review Focus #4: switching the filter replaces the list instead of appending to it.
  await page.getByRole('button', { name: 'Concluídos', exact: true }).click()
  await expect(mine).toHaveCount(0)
})

test('Transações loads the next page on scroll', async ({ page, request }, testInfo) => {
  const prefix = uniqueName(testInfo, 'TxPag')
  const res = await request.post(`${E2E_API_URL}/v1/categories`, { headers: AUTH, data: { name: prefix } })
  const categoryId = (await res.json()).data.id
  const date = '2035-01-01T12:00:00Z'
  await seed(
    request,
    '/v1/transactions',
    Array.from({ length: COUNT }, (_, i) => ({ name: `${prefix} ${i}`, amount: 1, type: 1, date, categoryId })),
  )

  await page.goto('/transacoes')
  const mine = page.getByText(new RegExp(`^${prefix} \\d+$`))
  await expect(page.getByRole('button', { name: 'Carregar mais' })).toBeVisible()
  expect(await mine.count()).toBeLessThan(COUNT)

  await scrollToEnd(page, async () => (await mine.count()) === COUNT)
  await expect(mine).toHaveCount(COUNT)
})

test('metric cards come from the summary, not from the loaded page (Review Focus #5)', async ({ page }) => {
  await page.route('**/v1/services/summary?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { total: 12345.67, consolidated: 0, receivable: 0, expenses: 0, netForecast: 12345.67, todayScheduled: 0 },
        metadata: { requestId: 'x', timestamp: new Date().toISOString() },
      }),
    }),
  )
  await page.goto('/servicos')
  const summary = page.getByRole('region', { name: 'Resumo dos serviços' })
  await expect(summary.getByText(/12\.345,67/).first()).toBeVisible()
})
