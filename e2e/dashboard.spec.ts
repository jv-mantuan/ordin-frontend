import { expect, test } from './fixtures'

test('dashboard loads its data from the API', async ({ page }) => {
  const transactions = page.waitForResponse((r) => r.url().includes('/v1/transactions/summary?') && r.request().method() === 'GET')
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  expect((await transactions).status()).toBe(200)
  await expect(page.getByText('Erro inesperado')).toHaveCount(0)
})

test('navigation reaches the other pages (sidebar on desktop, bottom bar on mobile)', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Transações' }).filter({ visible: true }).click()
  await expect(page).toHaveURL(/\/transacoes$/)
  await expect(page.getByRole('heading', { name: 'Transações' })).toBeVisible()

  await page.getByRole('link', { name: 'Categorias' }).filter({ visible: true }).click()
  await expect(page).toHaveURL(/\/categorias$/)
  await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible()
})

test('the month title reads "Novembro de 2026" on one line', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 14, 12, 0))
  await page.goto('/')
  const title = page.getByText('Novembro de 2026', { exact: true })
  await expect(title).toBeVisible()
  const box = (await title.boundingBox())!
  const lineHeight = await title.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.5)
  expect(box.height).toBeLessThan(lineHeight * 1.5)

  await page.getByRole('button', { name: 'Mês anterior' }).click()
  await expect(page.getByText('Outubro de 2026', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Próximo mês' }).click()
  await expect(title).toBeVisible()
})

test('the donut is drawn when all expenses are in one category', async ({ page }) => {
  await page.route('**/v1/transactions/summary?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          income: 0,
          expense: 100,
          balance: -100,
          expenseByCategory: [{ categoryId: '11111111-1111-1111-1111-111111111111', categoryName: 'Única', total: 100 }],
          expenseByDay: [{ day: '2026-11-14', total: 100 }],
        },
        metadata: { requestId: 'x', timestamp: '' },
      }),
    }),
  )
  await page.goto('/')
  const ring = page.locator('svg path[data-donut-segment]').first()
  await expect(ring).toBeVisible()
  const box = (await ring.boundingBox())!
  expect(box.width).toBeGreaterThan(60)
})
