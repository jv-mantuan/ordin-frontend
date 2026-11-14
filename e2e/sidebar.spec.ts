import { expect, test } from './fixtures'
import type { Page } from '@playwright/test'

const sidebarWidth = async (page: Page) =>
  (await page.getByRole('complementary', { name: 'Menu' }).boundingBox())!.width

test.describe('sidebar', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'phones use the bottom bar, there is no sidebar')
  })

  test('collapses to icons, keeps working, and remembers it after a reload', async ({ page }) => {
    await page.goto('/')
    const before = await sidebarWidth(page)

    await page.getByRole('button', { name: 'Recolher menu' }).click()
    await expect.poll(() => sidebarWidth(page)).toBeLessThanOrEqual(72)

    // Icon-only links keep their names, so navigation still works.
    await page.getByRole('link', { name: 'Transações' }).click()
    await expect(page).toHaveURL(/\/transacoes$/)

    await page.reload()
    await expect.poll(() => sidebarWidth(page)).toBeLessThanOrEqual(72)

    await page.getByRole('button', { name: 'Expandir menu' }).click()
    await expect.poll(() => sidebarWidth(page)).toBeCloseTo(before, 0)
  })

  test('resizes by dragging or with the keyboard, within limits, and remembers it', async ({ page }) => {
    await page.goto('/')
    const handle = page.getByRole('separator', { name: 'Redimensionar menu' })
    const start = await sidebarWidth(page)

    const box = (await handle.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + 200)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2 + 60, box.y + 200, { steps: 5 })
    await page.mouse.up()
    await expect.poll(() => sidebarWidth(page)).toBeCloseTo(start + 60, -1)

    await handle.focus()
    await page.keyboard.press('ArrowRight')
    await expect.poll(() => sidebarWidth(page)).toBeCloseTo(start + 76, -1)

    // Never wider than the maximum, however far it is dragged.
    const box2 = (await handle.boundingBox())!
    await page.mouse.move(box2.x + 2, box2.y + 200)
    await page.mouse.down()
    await page.mouse.move(box2.x + 800, box2.y + 200, { steps: 5 })
    await page.mouse.up()
    await expect.poll(() => sidebarWidth(page)).toBeLessThanOrEqual(320)

    const wide = await sidebarWidth(page)
    await page.reload()
    await expect.poll(() => sidebarWidth(page)).toBeCloseTo(wide, 0)

    // Double-click puts it back to the default width.
    await handle.dblclick()
    await expect.poll(() => sidebarWidth(page)).toBeCloseTo(start, 0)
  })
})
