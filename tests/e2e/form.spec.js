import { test, expect } from '@playwright/test';

test('fills form fields and validates parsed submit payload', async ({ page }) => {
  let submittedValid = null;
  let submittedErrors = null;
  let submittedData = null;

  page.on('console', async (msg) => {
    const text = msg.text();
    if (text.includes('Submited validation') && !text.includes('errors')) {
      const args = msg.args();
      if (args.length > 1) submittedValid = await args[1].jsonValue();
    }
    if (text.includes('Submited validation errors')) {
      const args = msg.args();
      if (args.length > 1) submittedErrors = await args[1].jsonValue();
    }
    if (text.includes('Submited data parsed')) {
      const args = msg.args();
      if (args.length > 1) submittedData = await args[1].jsonValue();
    }
  });

  await page.goto('/examples/index.html');

  await page.locator('form-input[name="test"]').locator('input').fill('match1');
  await page.locator('form-input[name="test2"]').locator('input').fill('user@example.com');
  await page.locator('form-input[name="test3"]').locator('input').fill('match1');
  await page.locator('form-input[name="test4"]').locator('select').selectOption('2');
  await page.locator('form-input[name="test5"]').locator('input').fill('2020-06-10');
  await page.locator('form-input[name="test6"]').locator('input').fill('25');
  await page.locator('form-input[name="test7"]').locator('input[type="radio"]').nth(2).check();
  await page.locator('form-input[name="test8"]').locator('input[type="checkbox"]').nth(2).check();
  await page.locator('form-input[name="test9"]').locator('textarea').fill('a valid textarea content');
  await page.locator('form-input[name="test10"]').first().locator('input').fill('https://example.com');
  await page.locator('form-input[name="test10b"]').locator('input').fill('queryterm');
  await page.locator('form-input[name="test11"]').locator('input').fill('#ffffff');
  await page.locator('form-input[name="test12"]').locator('input').fill('2020-06-10T12:30');
  await page.locator('form-input[name="test13"]').locator('input[type="checkbox"]').check();
  await page.locator('form-input[name="test14"]').locator('input[type="checkbox"]').check();
  await page.locator('form-input[name="test15"]').locator('input').fill('12345');
  await page.locator('form-input[name="test16"]').locator('input').fill('123456');
  await page.locator('form-input[name="test17"]').locator('input').fill('11987654321');
  await page.locator('form-input[name="test18"]').locator('input').fill('12345678901234');

  await page.getByRole('button', { name: 'Enter' }).click();

  await expect.poll(() => submittedValid).toBe(true);
  await expect.poll(() => submittedErrors).toEqual({});
  await expect.poll(() => submittedData).toMatchObject({
    test: 'match1',
    test2: 'user@example.com',
    test3: 'match1',
    test4: 2,
    test5: '2020-06-10',
    test6: 25,
    test7: 2,
    test8: ['2'],
    test9: 'a valid textarea content',
    test10: 'https://example.com',
    test10b: 'queryterm',
    test11: '#ffffff',
    test12: '2020-06-10T12:30',
    test13: true,
    test14: 'optin',
  });
});
