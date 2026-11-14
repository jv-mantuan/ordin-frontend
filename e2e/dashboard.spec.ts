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
