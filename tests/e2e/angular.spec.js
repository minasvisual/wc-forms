import { test, expect } from '@playwright/test'

test.describe('Angular CDN example', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 })
    await page.goto('/examples/angular.html')
    await expect(page.locator('wc-forms-angular-demo')).toBeVisible()
    await expect(page.locator('#boot-error')).toHaveClass(/hidden/)
  })

  test('renders Angular page shell', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Angular App (CDN) + wc-forms-kit' })).toBeVisible()
    await expect(page.locator('main')).toHaveScreenshot('angular-cdn-main.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    })
  })

  test('renders payload card after submit', async ({ page }) => {
    await page.locator('form-input[name="username"]').locator('input').fill('angular-user')
    await page.locator('form-input[name="email"]').locator('input').fill('angular@example.com')
    await page.locator('form-input[name="frameworks"]').locator('input[type="checkbox"]').first().check()

    const pillsInput = page.locator('form-input[name="tags"]').locator('input')
    await pillsInput.fill('web')
    await pillsInput.press('Enter')
    await pillsInput.fill('components')
    await pillsInput.press('Enter')

    await page.getByRole('button', { name: 'Submit' }).click()

    const result = page.locator('#angular-result')
    await expect(result).toBeVisible()
    await expect(result).toContainText('"username": "angular-user"')
    await expect(result).toContainText('"frameworks": [')
    await expect(result).toHaveScreenshot('angular-cdn-result.png', {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    })
  })

  test('reset clears values after setFormValues hydration', async ({ page }) => {
    await page.getByRole('button', { name: 'Fill form' }).click()

    const userInput = page.locator('form-input[name="username"]').locator('input')
    const emailInput = page.locator('form-input[name="email"]').locator('input')
    const checkedAngular = page.locator('form-input[name="frameworks"]').locator('input[type="checkbox"]').first()
    const pillsRoot = page.locator('form-input[name="tags"]').locator('.wc-form-pill')

    await expect(userInput).toHaveValue('angular-user')
    await expect(emailInput).toHaveValue('angular@example.com')
    await expect(checkedAngular).toBeChecked()
    await expect(pillsRoot).toHaveCount(2)

    await page.getByRole('button', { name: 'Reset' }).click()

    await expect(userInput).toHaveValue('')
    await expect(emailInput).toHaveValue('')
    await expect(checkedAngular).not.toBeChecked()
    await expect(pillsRoot).toHaveCount(0)
  })
})
