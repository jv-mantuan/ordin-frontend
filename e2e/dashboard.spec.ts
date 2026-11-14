import { expect, test } from './fixtures'

test('dashboard loads its data from the API', async ({ page }) => {
  const transactions = page.waitForResponse((r) => r.url().endsWith('/v1/transactions') && r.request().method() === 'GET')
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
