import { E2E_API_URL, expect, test, uniqueName } from './fixtures'

test('a row action shows progress while the API works', async ({ page, request }, testInfo) => {
  const name = uniqueName(testInfo, 'Lento')
  const res = await request.post(`${E2E_API_URL}/v1/services`, {
    headers: { Authorization: 'Bearer e2e' },
    data: { name, date: '2030-02-02', amount: 50, receivedAmount: 0, expenses: 0 },
  })
  expect(res.ok()).toBeTruthy()

  // Hold the conclude call for a moment so the in-progress state is observable.
  await page.route('**/v1/services/*/complete', async (route) => {
    await new Promise((r) => setTimeout(r, 1500))
    await route.continue()
  })

  await page.goto('/servicos')
  const button = page.getByRole('button', { name: `Concluir ${name}` })
  await button.click()
  await expect(button).toHaveText(/Concluindo/)
  await expect(button).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByTestId(/^service-/).filter({ hasText: name })).toHaveAttribute('aria-busy', 'true')
  await expect(page.getByText('Serviço concluído!')).toBeVisible()
})
