import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, workers: 1,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    browserName: 'chromium',
    launchOptions: { ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) },
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'npm run start -w backend', url: 'http://127.0.0.1:5000/api/health', reuseExistingServer: false, timeout: 30000 },
    { command: 'npm run dev -w frontend', url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 30000 },
  ],
});
