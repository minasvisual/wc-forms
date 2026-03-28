import { test, expect } from '@playwright/test';

test('Autocomplete field returns numeric value 2 instead of label', async ({ page }) => {
  let submittedData = null;

  page.on('console', async (msg) => {
    const text = msg.text();
    const args = msg.args();
    if (text.includes('Submited data parsed')) {
      if (args.length > 1) submittedData = await args[1].jsonValue();
    }
  });

  await page.goto('/tests/e2e/autocomplete_only.html');

  const autocompleteInput = page.locator('form-input[name="autocompleteField"] input');
  await autocompleteInput.fill('Option');

  const suggestion = page.locator('li[part="autocomplete-item"]').filter({ hasText: 'Option 2' });
  await suggestion.click();

  // Check if label is shown in input
  await expect(autocompleteInput).toHaveValue('2');

  await page.getByRole('button', { name: 'Submit' }).click();

  await expect.poll(() => submittedData).not.toBeNull();

  // Verify submitted data has value 2 (number!)
  expect(submittedData.autocompleteField).toBe(2);
  expect(typeof submittedData.autocompleteField).toBe('number');
});
