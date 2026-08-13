import { defineConfig, devices } from '@playwright/test';

/**
 * Set baseURL via env:
 *  - LOCAL:  nxpx http-server . -p 4173 && BASE_URL=http://localhost:4173 npm run test:smoke
 *  - CI:     BASE_URL=https://...
 */

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';

const isCI = !!process.env.CI ? false : true;

export default defineConfig({
  testDir: './tests',
  fullParallel: true,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: isCI ? 2 : 0,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-report.json' }],
    ['list'],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results',
});
