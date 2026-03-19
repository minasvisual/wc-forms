import { test, expect } from '@playwright/test';

test.describe('Form Fields Independent Validations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/index.html');
  });

  test('Text field validation (minlen)', async ({ page }) => {
    const input = page.locator('form-input[name="test"] input');
    const errors = page.locator('form-input[name="test"] .wc-errors');

    await input.fill('abc');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);
    await expect(errors).toContainText('at least 5');

    await input.fill('abcdef');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Email field validation', async ({ page }) => {
    const input = page.locator('form-input[name="test2"] input');
    const errors = page.locator('form-input[name="test2"] .wc-errors');

    await input.fill('invalidemail');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);
    await expect(errors).toContainText('valid email');

    await input.fill('valid@example.com');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Password field validation and confirm', async ({ page }) => {
    const password = page.locator('form-input[name="test3"] input');
    const errors = page.locator('form-input[name="test3"] .wc-errors');

    await password.fill('abc');
    await password.blur();
    await expect(errors).not.toHaveClass(/hidden/);
    
    // Confirm test is tied to main "test" param on validations
    await page.locator('form-input[name="test"] input').fill('matchpwd');
    await password.fill('matchpwd');
    await password.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Select field validation', async ({ page }) => {
    const select = page.locator('form-input[name="test4"] select');
    const errors = page.locator('form-input[name="test4"] .wc-errors');

    await select.selectOption('1');
    await select.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await select.selectOption('2');
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Date field validation', async ({ page }) => {
    const input = page.locator('form-input[name="test5"] input');
    const errors = page.locator('form-input[name="test5"] .wc-errors');

    // out of boundary validation
    await input.fill('2019-12-31');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    // valid input date
    await input.fill('2020-06-15');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Number field validation', async ({ page }) => {
    const input = page.locator('form-input[name="test6"] input');
    const errors = page.locator('form-input[name="test6"] .wc-errors');

    await input.fill('4'); 
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await input.fill('50');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Radioboxes validation', async ({ page }) => {
    const radio1 = page.locator('form-input[name="test7"] input[type="radio"]').nth(0);
    const radio3 = page.locator('form-input[name="test7"] input[type="radio"]').nth(2); 
    const errors = page.locator('form-input[name="test7"] .wc-errors');

    await radio1.check();
    await expect(errors).not.toHaveClass(/hidden/);

    await radio3.check();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Checkboxes validation', async ({ page }) => {
    const check1 = page.locator('form-input[name="test8"] input[type="checkbox"]').nth(0); 
    const check3 = page.locator('form-input[name="test8"] input[type="checkbox"]').nth(2);
    const errors = page.locator('form-input[name="test8"] .wc-errors');

    await check1.check();
    await expect(errors).not.toHaveClass(/hidden/);

    await check1.uncheck();
    await check3.check();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Textarea validation', async ({ page }) => {
    const textarea = page.locator('form-input[name="test9"] textarea');
    const errors = page.locator('form-input[name="test9"] .wc-errors');

    await textarea.fill('abc');
    await textarea.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await textarea.fill('valid textarea text');
    await textarea.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('URL field validation', async ({ page }) => {
    const input = page.locator('form-input[name="test10"] input');
    const errors = page.locator('form-input[name="test10"] .wc-errors');

    await input.fill('invalid-url');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await input.fill('https://example.com');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Search field behavior', async ({ page }) => {
    const input = page.locator('form-input[name="test10b"] input');
    const errors = page.locator('form-input[name="test10b"] .wc-errors');

    await input.fill('dev');
    await input.blur();
    await expect(errors).not.toHaveClass(/hidden/);

    await input.fill('developer');
    await input.blur();
    await expect(errors).toHaveClass(/hidden/);
  });

  test('Currency custom mask reaction', async ({ page }) => {
    const input = page.locator('form-input[name="test15"] input');
    
    await input.pressSequentially('12345');
    await expect(input).toHaveValue('123.45');
  });

  test('Document native mask format', async ({ page }) => {
    const input = page.locator('form-input[name="test18"] input');
    
    await input.pressSequentially('12345678901');
    await expect(input).toHaveValue('123.456.789-01');
  });
});
