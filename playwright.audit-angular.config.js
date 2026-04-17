import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'audit-angular.spec.js',
  timeout: 120_000,
  use: {
    baseURL: 'http://127.0.0.1:4321',
    headless: true,
  },
  webServer: {
    command: 'npm run dev -- --port 4321 --host 127.0.0.1',
    cwd: './audit/angular',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
