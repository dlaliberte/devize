import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  outputDir: 'test-results/',
  webServer: {
    command: 'npm run build && npm run serve',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
