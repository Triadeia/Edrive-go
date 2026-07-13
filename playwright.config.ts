import { defineConfig, devices } from "@playwright/test";

const localBaseURL = "http://127.0.0.1:3000";
const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: remoteBaseURL ?? localBaseURL,
    trace: "retain-on-failure",
  },
  webServer: remoteBaseURL
    ? undefined
    : {
        command: "npm run dev",
        url: localBaseURL,
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
