import { test, expect } from '@playwright/test';

test('pills keeps existing tags and keeps focus after commit', async ({ page }) => {
  let submittedData = null;

  page.on('console', async (msg) => {
    const text = msg.text();
    const args = msg.args();
    if (text.includes('Submited data parsed')) {
      if (args.length > 1) submittedData = await args[1].jsonValue();
    }
  });

  await page.goto('/tests/e2e/pills_only.html');

  const input = page.locator('form-input[name="tags"] input');

  await input.fill('alpha');
  await input.press('Enter');

  // Focus returns to input after adding a tag.
  await expect(input).toBeFocused();
  await expect(page.locator('form-input[name="tags"] [part="pill-label"]')).toHaveCount(1);

  await input.fill('beta');
  await input.press('Enter');

  const labels = page.locator('form-input[name="tags"] [part="pill-label"]');
  await expect(labels).toHaveCount(2);
  await expect(labels.nth(0)).toHaveText('alpha');
  await expect(labels.nth(1)).toHaveText('beta');

  // Remove first tag and ensure input keeps focus.
  await page.locator('form-input[name="tags"] [part="pill-remove"]').first().click();
  await expect(input).toBeFocused();
  await expect(page.locator('form-input[name="tags"] [part="pill-label"]')).toHaveCount(1);
  await expect(page.locator('form-input[name="tags"] [part="pill-label"]').first()).toHaveText('beta');

  await page.getByRole('button', { name: 'Submit' }).click();
  await expect.poll(() => submittedData).not.toBeNull();
  expect(submittedData.tags).toEqual(['beta']);
});
