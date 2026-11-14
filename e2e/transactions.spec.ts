import { createCategoryViaApi, expect, test, uniqueName } from './fixtures'

test('create, edit and delete a transaction', async ({ page, request }, testInfo) => {
  const category = await createCategoryViaApi(request, uniqueName(testInfo, 'Cat tx'))
  const description = uniqueName(testInfo, 'Mercado')
  const edited = uniqueName(testInfo, 'Feira')

  await page.goto('/transacoes')

  // Create
  await page.getByRole('button', { name: '+ Nova transação' }).click()
  await page.getByLabel('Descrição').fill(description)
  await page.getByLabel('Valor').fill('12,34')
  await page.getByLabel('Tipo').selectOption({ label: 'Despesa' })
  await page.getByLabel('Data').fill('2026-11-10')
  await page.getByLabel('Categoria').selectOption({ label: category.name })
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Transação criada com sucesso!')).toBeVisible()
  await expect(page.getByText(description, { exact: true })).toBeVisible()
  await expect(page.getByText(/12,34/).first()).toBeVisible()

  // Edit
  await page.getByRole('button', { name: `Editar ${description}` }).click()
  await expect(page.getByText('Editar transação')).toBeVisible()
  await expect(page.getByLabel('Descrição')).toHaveValue(description)
  await page.getByLabel('Descrição').fill(edited)
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Transação atualizada com sucesso!')).toBeVisible()
  await expect(page.getByText(edited, { exact: true })).toBeVisible()
  await expect(page.getByText(description, { exact: true })).toHaveCount(0)

  // Delete (confirmed with window.confirm)
  page.once('dialog', (dialog) => void dialog.accept())
  await page.getByRole('button', { name: `Excluir ${edited}` }).click()
  await expect(page.getByText('Transação removida com sucesso!')).toBeVisible()
  await expect(page.getByText(edited, { exact: true })).toHaveCount(0)
})
