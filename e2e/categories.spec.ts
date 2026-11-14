import { expect, test, uniqueName } from './fixtures'

// Known bug: on mobile the category sheet (zIndex 30, src/pages/Categories/index.tsx) sits under
// BottomNav (z-index 50), which covers "Salvar". Remove this once the sheet is above the nav.
test.fixme(({ isMobile }) => isMobile, 'category sheet is covered by BottomNav on mobile')

test('create, rename and delete a category', async ({ page }, testInfo) => {
  const name = uniqueName(testInfo, 'Cat')
  const renamed = uniqueName(testInfo, 'Cat renomeada')

  await page.goto('/categorias')

  // Create
  await page.getByRole('button', { name: '+ Nova categoria' }).click()
  await page.getByPlaceholder('Ex.: Alimentação').fill(name)
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Categoria criada com sucesso!')).toBeVisible()
  await expect(page.getByText(name, { exact: true })).toBeVisible()

  // Rename
  await page.getByRole('button', { name: `Editar ${name}` }).click()
  await expect(page.getByText('Editar categoria')).toBeVisible()
  await page.getByPlaceholder('Ex.: Alimentação').fill(renamed)
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Categoria atualizada com sucesso!')).toBeVisible()
  await expect(page.getByText(renamed, { exact: true })).toBeVisible()
  await expect(page.getByText(name, { exact: true })).toHaveCount(0)

  // Delete (no confirmation dialog for categories)
  await page.getByRole('button', { name: `Excluir ${renamed}` }).click()
  await expect(page.getByText(renamed, { exact: true })).toHaveCount(0)
})

test('an empty name is rejected', async ({ page }) => {
  await page.goto('/categorias')
  await page.getByRole('button', { name: '+ Nova categoria' }).click()
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Nova categoria', { exact: true })).toBeVisible()
  await expect(page.getByText('Categoria criada com sucesso!')).toHaveCount(0)
})
