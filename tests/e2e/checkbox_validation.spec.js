import { test, expect } from '@playwright/test';

test('Checkbox validation "in" works with "some" logic', async ({ page }) => {
  await page.goto('/index.html');

  // Find checkboxes for checkboxField
  const checkboxGroup = page.locator('form-input[name="checkboxField"]');
  const check1 = checkboxGroup.locator('input[type="checkbox"]').nth(0);
  const check2 = checkboxGroup.locator('input[type="checkbox"]').nth(1);
  const errorMsg = checkboxGroup.locator('.wc-errors');

  // Initial state: not checked, so error should be shown after validation
  // We can trigger validation by clicking and blur, but select/deselect is easier if we hit submit
  await page.getByRole('button', { name: 'Enter' }).click();
  await expect(errorMsg).not.toHaveClass(/hidden/);

  // 1. Select 'check1'. Since rule is 'in:check2', it should STILL be invalid because 'check1' is not in 'check2'.
  await check1.check();
  // Wait for validation to trigger (on change)
  await expect(errorMsg).not.toHaveClass(/hidden/);

  // 2. Select 'check2' (multi-select). Now 'value' is ['check1', 'check2'].
  // Since 'check2' is in params ['check2'], it should PASS (due to 'some' logic).
  await check2.check();
  
  // Verify it's now valid (error hidden)
  await expect(errorMsg).toHaveClass(/hidden/);

  // 3. Uncheck 'check2'. Back to ['check1']. Should BE INVALID again.
  await check2.uncheck();
  await expect(errorMsg).not.toHaveClass(/hidden/);
});
