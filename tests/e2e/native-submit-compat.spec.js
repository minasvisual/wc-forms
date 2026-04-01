import { test, expect } from '@playwright/test';

/**
 * Static page has no application JavaScript beyond loading the library.
 * Submit is triggered by clicking the native submit button; we assert
 * `submited` detail matches `getFormValuesNested(form)` (FormData + control types).
 */
test('native button submit: e.detail matches getFormValuesNested in browser', async ({ page }) => {
  await page.goto('/tests/e2e/native_submit_compat.html');

  const result = await page.evaluate(async () => {
    const form = document.querySelector('form[is="form-control"]');
    if (!form) throw new Error('form not found');

    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('submited timeout')), 15_000);

      form.addEventListener('submited', async (e) => {
        clearTimeout(t);
        try {
          const mod = await import('/src/helpers.js');
          const fromFormData = mod.getFormValuesNested(form);
          resolve({
            detail: e.detail,
            valid: e.valid,
            fromFormData,
            formDataKeys: [...new FormData(form).keys()],
          });
        } catch (err) {
          reject(err);
        }
      });

      const btn = form.querySelector('button[type="submit"]');
      if (!btn) reject(new Error('submit button not found'));
      else btn.click();
    });
  });

  expect(result.valid).toBe(true);
  expect(result.detail).toEqual({ title: 'Hello', count: 42 });
  expect(result.detail).toEqual(result.fromFormData);
  expect(result.formDataKeys.sort()).toEqual(['count', 'title']);
});
