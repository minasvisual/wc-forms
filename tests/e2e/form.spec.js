import { test, expect } from '@playwright/test';

test('fills form fields and validates parsed submit payload', async ({ page }) => {
  let submittedValid = null;
  let submittedErrors = null;
  let submittedData = null;

  page.on('dialog', dialog => dialog.dismiss());

  page.on('console', async (msg) => {
    const text = msg.text();
    const args = msg.args();
    let val = null;
    if (args.length > 1) val = await args[1].jsonValue().catch(()=>null);
    console.log('BROWSER CONSOLE:', text, val);

    if (text.includes('Submited validation') && !text.includes('errors')) {
      if (args.length > 1) submittedValid = await args[1].jsonValue();
    }
    if (text.includes('Submited validation errors')) {
      if (args.length > 1) submittedErrors = await args[1].jsonValue();
    }
    if (text.includes('Submited data parsed')) {
      if (args.length > 1) submittedData = await args[1].jsonValue();
    }
  });

  await page.goto('/examples/vanila.html');

  await page.locator('form-input[name="textField"]').locator('input').fill('match1');
  await page.locator('form-input[name="emailField"]').locator('input').fill('user@example.com');
  await page.locator('form-input[name="passwordField"]').locator('input').fill('match1');
  await page.locator('form-input[name="selectField"]').locator('select').selectOption('2');
  await page.locator('form-input[name="selectFieldHtml"]').locator('select').selectOption('2');
  await page.locator('form-input[name="dateField"]').locator('input').fill('2026-06-10');
  await page.locator('form-input[name="numberField"]').locator('input').fill('25');
  
  await page.locator('form-input[name="radioboxesField"]').locator('input[type="radio"]').nth(2).check();
  
  // check index 0 (check1) and index 2 (check3), both satisfy in:0,2
  await page.locator('form-input[name="checkboxField"]').locator('input[type="checkbox"]').nth(0).check();
  await page.locator('form-input[name="checkboxField"]').locator('input[type="checkbox"]').nth(2).check();
  
  await page.locator('form-input[name="textareaField"]').locator('textarea').fill('a valid textarea content');
  await page.locator('form-input[name="urlField"]').locator('input').fill('https://example.com');
  await page.locator('form-input[name="searchField"]').locator('input').fill('developer');
  await page.locator('form-input[name="colorField"]').locator('input').fill('#ffffff');
  await page.locator('form-input[name="dateTimeField"]').locator('input').fill('2026-06-10T12:30');
  
  await page.locator('form-input[name="booleanField"]').locator('input[type="checkbox"]').check();
  await page.locator('form-input[name="checkboxValueField"]').locator('input[type="checkbox"]').check();
  
  await page.locator('form-input[name="currencyField"]').locator('input').fill('12345');
  await page.locator('form-input[name="maskField"]').locator('input').fill('123456');
  await page.locator('form-input[name="maskFieldUnmaskedReturn"]').locator('input').fill('11987654321');
  await page.locator('form-input[name="customMaskField"]').locator('input').fill('12345678901234');

  await page.evaluate(() => {
    let form = document.querySelector('form');
    let invalids = [];
    for (let el of form.elements) {
      if (!el.checkValidity()) invalids.push({ name: el.name, msg: el.validationMessage });
    }
    console.log('INVALID ELEMENTS:', JSON.stringify(invalids));
  });

  await page.getByRole('button', { name: 'Enter' }).click();

  await expect.poll(() => submittedValid).toBe(true);
  await expect.poll(() => submittedErrors).toEqual({});
  await expect.poll(() => submittedData).toMatchObject({
    textField: 'match1',
    emailField: 'user@example.com',
    passwordField: 'match1',
    selectField: 2,
    dateField: '2026-06-10',
    numberField: 25,
    radioboxesField: 2,
    checkboxField: ['0', '2'], // indices from FormChecks (item.value || index)
    textareaField: 'a valid textarea content',
    urlField: 'https://example.com',
    searchField: 'developer',
    colorField: '#ffffff',
    dateTimeField: '2026-06-10T12:30',
    booleanField: true,
    checkboxValueField: 'optin',
  });
});
