import { expect, test } from './fixtures'

test('glass look: translucent cards over a glowing background, blurred overlays', async ({ page }) => {
  await page.goto('/servicos')
  const summary = page.getByRole('region', { name: 'Resumo dos serviços' })
  await expect(summary).toBeVisible()

  // Cards are see-through (alpha < 1) …
  const cardBg = await summary.evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(cardBg).toMatch(/rgba\(.+, 0\.\d+\)/)

  // … over a background with radial glows.
  const appBg = await page.locator('[data-app-shell]').evaluate((el) => getComputedStyle(el).backgroundImage)
  expect(appBg).toContain('radial-gradient')

  // Overlays that sit on top of content blur what is behind them.
  await page.getByRole('button', { name: '+ Novo serviço' }).click()
  const dialog = page.getByRole('dialog')
  const blur = await dialog.evaluate((el) => getComputedStyle(el).backdropFilter)
  expect(blur).toContain('blur')
})

test('reduced transparency falls back to solid surfaces', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' })
  const page = await context.newPage()
  // Emulate the OS setting before the app reads it.
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window)
    window.matchMedia = (q: string) =>
      q.includes('prefers-reduced-transparency')
        ? ({ matches: true, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false } as MediaQueryList)
        : real(q)
    localStorage.setItem('ordin.e2e.session', JSON.stringify({ user: { id: '902d93b1-1ef8-4cc2-adbb-a6ba80144587', email: 'master@master.com', name: 'Master E2E', emailVerified: true } }))
  })
  await page.goto('/servicos')
  const summary = page.getByRole('region', { name: 'Resumo dos serviços' })
  await expect(summary).toBeVisible()
  expect(await summary.evaluate((el) => getComputedStyle(el).backgroundColor)).toMatch(/^rgb\(/)
  await context.close()
})
