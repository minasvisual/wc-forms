import { test, expect } from '@playwright/test';

test.describe('Form Fields Independent Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/vanila.html');
  });

  test('Text field validation (minlen)', async ({ page }) => {
    const input = page.locator('form-input[name="textField"] input');
    const errors = page.locator('form-input[name="textField"] .wc-errors');

    await input.fill('abc');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);
    await expect(errors).toContainText('pelo menos 5');

    await input.fill('abcdef');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Email field validation', async ({ page }) => {
    const input = page.locator('form-input[name="emailField"] input');
    const errors = page.locator('form-input[name="emailField"] .wc-errors');

    await input.fill('invalidemail');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);
    await expect(errors).toContainText('e-mail válido');

    await input.fill('valid@example.com');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Password field validation and confirm', async ({ page }) => {
    const password = page.locator('form-input[name="passwordField"] input');
    const errors = page.locator('form-input[name="passwordField"] .wc-errors');

    await password.fill('abc');
    await password.blur();
    await expect(errors).not.toHaveClass(/hidden/);
    
    // Confirm test is tied to main "textField" param on validations
    await page.locator('form-input[name="textField"] input').fill('matchpwd');
    await password.fill('matchpwd');
    await password.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Select field validation', async ({ page }) => {
    const select = page.locator('form-input[name="selectField"] select');
    const errors = page.locator('form-input[name="selectField"] .wc-errors');

    await select.selectOption('1');
    await select.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await select.selectOption('2');
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Date field validation', async ({ page }) => {
    const input = page.locator('form-input[name="dateField"] input');
    const errors = page.locator('form-input[name="dateField"] .wc-errors');

    // out of boundary validation
    await input.fill('2019-12-31');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    // valid input date
    await input.fill('2026-06-15');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Number field validation', async ({ page }) => {
    const input = page.locator('form-input[name="numberField"] input');
    const errors = page.locator('form-input[name="numberField"] .wc-errors');

    await input.fill('4'); 
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await input.fill('50');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Radioboxes validation', async ({ page }) => {
    const radio1 = page.locator('form-input[name="radioboxesField"] input[type="radio"]').nth(0);
    const radio3 = page.locator('form-input[name="radioboxesField"] input[type="radio"]').nth(2); 
    const errors = page.locator('form-input[name="radioboxesField"] .wc-errors');

    await radio1.check();
    await expect(errors).not.toHaveClass(/hidden/);

    await radio3.check();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Checkboxes validation', async ({ page }) => {
    // in:0,2 means only indices 0 (check1) and 2 (check3) are valid.
    // index 1 (check2) is invalid.
    const check2 = page.locator('form-input[name="checkboxField"] input[type="checkbox"]').nth(1);
    const check3 = page.locator('form-input[name="checkboxField"] input[type="checkbox"]').nth(2);
    const errors = page.locator('form-input[name="checkboxField"] .wc-errors');

    // index 1 is NOT in allowed [0, 2]
    await check2.check();
    await expect(errors).not.toHaveClass(/hidden/);

    // uncheck index 1, check only index 2 which IS in the allowed list
    await check2.uncheck();
    await check3.check();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Textarea validation', async ({ page }) => {
    const textarea = page.locator('form-input[name="textareaField"] textarea');
    const errors = page.locator('form-input[name="textareaField"] .wc-errors');

    await textarea.fill('abc');
    await textarea.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await textarea.fill('valid textarea text');
    await textarea.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('URL field validation', async ({ page }) => {
    const input = page.locator('form-input[name="urlField"] input');
    const errors = page.locator('form-input[name="urlField"] .wc-errors');

    await input.fill('invalid-url');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await input.fill('https://example.com');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Search field behavior', async ({ page }) => {
    const input = page.locator('form-input[name="searchField"] input');
    const errors = page.locator('form-input[name="searchField"] .wc-errors');

    await input.fill('dev');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await input.fill('developer');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Currency custom mask reaction', async ({ page }) => {
    const input = page.locator('form-input[name="currencyField"] input');
    
    await input.pressSequentially('12345');
    await expect(input).toHaveValue('123.45');
  });

  test('Document native mask format', async ({ page }) => {
    const input = page.locator('form-input[name="customMaskField"] input');
    
    await input.pressSequentially('12345678901');
    await expect(input).toHaveValue('123.456.789-01');
  });
});
