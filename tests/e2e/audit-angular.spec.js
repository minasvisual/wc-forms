import { expect, test } from '@playwright/test';

test.describe('Angular CLI audit app', () => {
  test('invalid submit does not emit sent payload', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Angular audit + wc-forms-kit local' })).toBeVisible();

    await page.locator('form-input[type="submit"]').locator('button').click();

    await expect(page.locator('article.result')).toHaveCount(0);
  });

  test('(sent) updates view after submit (zoneless + AOT bridge)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Angular audit + wc-forms-kit local' })).toBeVisible();

    await page.getByRole('button', { name: 'Fill form' }).click();
    await page.locator('form-input[type="submit"]').locator('button').click();

    const result = page.locator('article.result');
    await expect(result).toBeVisible();
    await expect(result.locator('pre')).toContainText('auditangular');
    await expect(result.locator('pre')).toContainText('audit@angular.dev');
  });
});
