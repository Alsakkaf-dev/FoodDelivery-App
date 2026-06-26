import { defineConfig, devices } from '@playwright/test';

// E2E targets a mid-range Android viewport (the primary device, see D-20 §2.6).
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'android', use: { ...devices['Pixel 5'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // #20 responsive sweep — narrow phone (320) + tablet (768). These projects run the
    // cross-viewport specs ONLY (testMatch), so the existing specs stay on android+desktop.
    {
      name: 'mobile-narrow',
      testMatch: /(responsive|a11y|rtl-parity)\.spec\.ts/,
      use: { browserName: 'chromium', viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true },
    },
    {
      name: 'tablet',
      testMatch: /(responsive|a11y|rtl-parity)\.spec\.ts/,
      use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, hasTouch: true },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
