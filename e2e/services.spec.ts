import { E2E_API_URL, expect, test, uniqueName } from './fixtures'
import type { APIRequestContext, Page } from '@playwright/test'

/**
 * Every test runs as the same master user, in parallel with the other project (mobile/desktop).
 * "Concluir serviços de hoje" in one test may conclude another test's service dated today, so
 * tests only assert on their own services and use far-away dates unless "today" is the point.
 */

const pad = (n: number) => String(n).padStart(2, '0')
const localISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

async function createServiceViaApi(request: APIRequestContext, data: { name: string; date: string }) {
  const res = await request.post(`${E2E_API_URL}/v1/services`, {
    headers: { Authorization: 'Bearer e2e' },
    data: { amount: 100, receivedAmount: 0, expenses: 0, ...data },
  })
  expect(res.ok(), await res.text()).toBeTruthy()
  return (await res.json()).data as { id: string; name: string }
}

const showFilter = (page: Page, label: string) => page.getByRole('button', { name: label, exact: true }).click()

test('create, edit, conclude, reopen and cancel a service', async ({ page }, testInfo) => {
  const name = uniqueName(testInfo, 'Corte')
  const edited = uniqueName(testInfo, 'Corte e barba')

  await page.goto('/servicos')

  // Create (pt-BR amounts, blank Gastos = 0) — Review Focus #5
  await page.getByRole('button', { name: '+ Novo serviço' }).click()
  await expect(page.getByText('Novo serviço', { exact: true })).toBeVisible()
  await page.getByLabel('Nome').fill(name)
  await page.getByLabel('Cliente').fill('Ana')
  await page.getByLabel('Data').fill('2030-01-15')
  await page.getByLabel('Valor', { exact: true }).fill('1.234,56')
  await page.getByLabel('Já recebido').fill('234,56')
  await page.getByLabel('Anotações').fill('Levar tesoura')
  await expect(page.getByText(/A receber: R\$\s?1\.000,00/)).toBeVisible()
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Serviço criado com sucesso!')).toBeVisible()
  await expect(page.getByText(name, { exact: true })).toBeVisible()
  await expect(page.getByText(/1\.234,56/).first()).toBeVisible()

  // Edit
  await page.getByRole('button', { name: `Editar ${name}` }).click()
  await expect(page.getByText('Editar serviço', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Valor', { exact: true })).toHaveValue('1234,56')
  await page.getByLabel('Nome').fill(edited)
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('Serviço atualizado com sucesso!')).toBeVisible()
  await expect(page.getByText(edited, { exact: true })).toBeVisible()
  await expect(page.getByText(name, { exact: true })).toHaveCount(0)

  // Conclude: leaves Agendados, shows under Concluídos
  await page.getByRole('button', { name: `Concluir ${edited}` }).click()
  await expect(page.getByText('Serviço concluído!')).toBeVisible()
  await expect(page.getByText(edited, { exact: true })).toHaveCount(0)
  await showFilter(page, 'Concluídos')
  await expect(page.getByText(edited, { exact: true })).toBeVisible()

  // Reopen: back under Agendados
  await page.getByRole('button', { name: `Reabrir ${edited}` }).click()
  await expect(page.getByText('Serviço reaberto.')).toBeVisible()
  await showFilter(page, 'Agendados')
  await expect(page.getByText(edited, { exact: true })).toBeVisible()

  // Cancel (window.confirm): only under Cancelados
  page.once('dialog', (dialog) => void dialog.accept())
  await page.getByRole('button', { name: `Cancelar ${edited}` }).click()
  await expect(page.getByText('Serviço cancelado.')).toBeVisible()
  await expect(page.getByText(edited, { exact: true })).toHaveCount(0)
  await showFilter(page, 'Cancelados')
  await expect(page.getByText(edited, { exact: true })).toBeVisible()
})

test('rejects a received amount above the service amount', async ({ page }, testInfo) => {
  await page.goto('/servicos')
  await page.getByRole('button', { name: '+ Novo serviço' }).click()
  await page.getByLabel('Nome').fill(uniqueName(testInfo, 'Inválido'))
  await page.getByLabel('Data').fill('2030-01-15')
  await page.getByLabel('Valor', { exact: true }).fill('100')
  await page.getByLabel('Já recebido').fill('150')
  await page.getByRole('button', { name: 'Salvar' }).click()
  await expect(page.getByText('O valor recebido não pode ser maior que o valor do serviço')).toBeVisible()
  await expect(page.getByText('Novo serviço', { exact: true })).toBeVisible()
})

test("concludes today's services and leaves the others", async ({ page, request }, testInfo) => {
  const now = new Date()
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const today = await createServiceViaApi(request, { name: uniqueName(testInfo, 'Hoje'), date: localISO(now) })
  const later = await createServiceViaApi(request, { name: uniqueName(testInfo, 'Amanhã'), date: localISO(tomorrow) })

  await page.goto('/servicos')
  await showFilter(page, 'Todos')
  await expect(page.getByText(today.name, { exact: true })).toBeVisible()

  // The other project's run of this test may have concluded our service already (same user).
  const button = page.getByRole('button', { name: /Concluir serviços de hoje/ })
  if (await button.isEnabled()) {
    page.once('dialog', (dialog) => void dialog.accept())
    await button.click()
    await expect(page.getByText(/serviços? concluídos?|Nenhum serviço de hoje/).first()).toBeVisible()
  }

  await showFilter(page, 'Agendados')
  await expect(page.getByText(later.name, { exact: true })).toBeVisible()
  await showFilter(page, 'Concluídos')
  await expect(page.getByText(today.name, { exact: true })).toBeVisible()
  await expect(page.getByText(later.name, { exact: true })).toHaveCount(0)
})

test('"Hoje" follows the local date late at night', async ({ page, request }, testInfo) => {
  // 23:30 local on 14/11: toISOString() would already say the 15th in UTC−3 (Review Focus #4).
  await page.clock.setFixedTime(new Date(2026, 10, 14, 23, 30))
  const svc = await createServiceViaApi(request, { name: uniqueName(testInfo, 'Noite'), date: '2026-11-14' })

  await page.goto('/servicos')
  await showFilter(page, 'Todos')
  const row = page.getByTestId(`service-${svc.id}`)
  await expect(row.getByText('Hoje', { exact: true })).toBeVisible()
})

test('metric cards explain themselves', async ({ page }) => {
  await page.goto('/servicos')
  const summary = page.getByRole('region', { name: 'Resumo dos serviços' })
  for (const label of [
    'Faturamento total',
    'Faturamento consolidado',
    'A receber',
    'Despesas previstas',
    'Faturamento líquido previsto',
  ]) {
    await expect(summary.getByText(label, { exact: true })).toBeVisible()
  }
  await expect(summary.getByText(/R\$/).first()).toBeVisible()
  await page.getByRole('button', { name: 'Sobre A receber' }).click()
  await expect(page.getByRole('tooltip')).toContainText('Quanto ainda falta receber')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('tooltip')).toHaveCount(0)
})
