import { E2E_USER, expect, test, uniqueName } from './fixtures'

test('rename the user on /perfil', async ({ page }, testInfo) => {
  const newName = uniqueName(testInfo, 'Fulano')

  await page.goto('/perfil')
  await expect(page.getByRole('heading', { name: 'Perfil' })).toBeVisible()
  await expect(page.getByText(E2E_USER.email)).toBeVisible()

  const nameField = page.getByLabel('Nome')
  await expect(nameField).toHaveValue(E2E_USER.name)
  await nameField.fill(newName)
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Nome atualizado.')).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('Nome')).toHaveValue(newName)
})
