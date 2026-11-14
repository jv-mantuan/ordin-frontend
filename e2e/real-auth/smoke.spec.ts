import { existsSync } from 'node:fs'
import { expect, test } from '@playwright/test'

// Read-only: this runs against the Neon dev database with a real account.
test.skip(
  !existsSync('e2e/.auth/real-user.json'),
  'No saved session: pnpm exec playwright codegen --save-storage=e2e/.auth/real-user.json http://localhost:5173/login',
)

test('a saved real session opens the dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(page).not.toHaveURL(/\/login/)
})
