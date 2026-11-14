import { E2E_API_URL, expect, test, uniqueName } from './fixtures'

const AUTH = { Authorization: 'Bearer e2e' }

test('a custom period filters the list and the metrics', async ({ page, request }, testInfo) => {
  const march = uniqueName(testInfo, 'Março')
  const april = uniqueName(testInfo, 'Abril')
  for (const [name, date] of [[march, '2031-03-10'], [april, '2031-04-10']]) {
    const res = await request.post(`${E2E_API_URL}/v1/services`, {
      headers: AUTH,
      data: { name, date, amount: 100, receivedAmount: 0, expenses: 0 },
    })
    expect(res.ok()).toBeTruthy()
  }

  await page.goto('/servicos')
  await page.getByRole('button', { name: 'Todos', exact: true }).click()

  const summary = page.waitForRequest((r) => r.url().includes('/v1/services/summary') && r.url().includes('from=2031-03-01') && r.url().includes('to=2031-03-31'))
  await page.getByLabel('Período').selectOption({ label: 'Personalizado' })
  await page.getByLabel('De', { exact: true }).fill('2031-03-01')
  await page.getByLabel('Até', { exact: true }).fill('2031-03-31')
  await summary

  await expect(page.getByText(march, { exact: true })).toBeVisible()
  await expect(page.getByText(april, { exact: true })).toHaveCount(0)
})

test('"Este mês" sends the local month to the API', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 14, 23, 30))
  await page.goto('/servicos')
  const list = page.waitForRequest((r) => /\/v1\/services\?/.test(r.url()) && r.url().includes('from=2026-11-01') && r.url().includes('to=2026-11-30'))
  const summary = page.waitForRequest((r) => r.url().includes('/v1/services/summary') && r.url().includes('from=2026-11-01') && r.url().includes('to=2026-11-30'))
  await page.getByLabel('Período').selectOption({ label: 'Este mês' })
  await Promise.all([list, summary])
})

test('a reversed custom period is not applied and says why', async ({ page }) => {
  await page.goto('/servicos')
  await page.getByLabel('Período').selectOption({ label: 'Personalizado' })
  await page.getByLabel('De', { exact: true }).fill('2031-05-10')
  await page.getByLabel('Até', { exact: true }).fill('2031-05-01')
  await expect(page.getByText('A data inicial precisa ser antes da final.')).toBeVisible()
})

test('"Esta semana" sends Monday to Sunday of the local week', async ({ page }) => {
  // Saturday 14/11/2026 → week of Monday 09/11 to Sunday 15/11.
  await page.clock.setFixedTime(new Date(2026, 10, 14, 23, 30))
  await page.goto('/servicos')
  const summary = page.waitForRequest((r) => r.url().includes('/v1/services/summary') && r.url().includes('from=2026-11-09') && r.url().includes('to=2026-11-15'))
  await page.getByLabel('Período').selectOption({ label: 'Esta semana' })
  await summary
})
