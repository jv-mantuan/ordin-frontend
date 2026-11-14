import { expect, test } from './fixtures'

test.describe('signed out', () => {
  test.use({ signedIn: false })

  test('a protected page redirects to /login', async ({ page }) => {
    await page.goto('/perfil')
    await expect(page).toHaveURL(/\/login$/)
  })
})

test('"Sair" signs out, and a reload stays signed out', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  await page.getByRole('button', { name: 'Sair' }).filter({ visible: true }).first().click()
  await expect(page).toHaveURL(/\/login$/)

  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
})
