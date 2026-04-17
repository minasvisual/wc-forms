import { expect, test } from '@playwright/test';

test.describe('Angular CLI audit app', () => {
  test('(sent) updates view after submit (zoneless + AOT bridge)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Angular audit + wc-forms-kit local' })).toBeVisible();

    await page.getByRole('button', { name: 'Fill form' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();

    const result = page.locator('article.result');
    await expect(result).toBeVisible();
    await expect(result.locator('pre')).toContainText('audit-angular');
    await expect(result.locator('pre')).toContainText('audit@angular.dev');
  });
});
