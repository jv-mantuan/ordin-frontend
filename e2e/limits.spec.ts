import { expect, test } from './fixtures'

test('a rate-limited read shows the API message in a toast', async ({ page }) => {
  await page.route('**/v1/services?**', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({
          status: 429,
          headers: { 'Retry-After': '1' },
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Muitas requisições em sequência. Tente novamente em alguns segundos.' }),
        })
      : route.fallback(),
  )
  await page.goto('/servicos')
  await expect(page.getByText('Muitas requisições em sequência. Tente novamente em alguns segundos.')).toHaveCount(1)
})
