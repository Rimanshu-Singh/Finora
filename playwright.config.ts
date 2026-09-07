import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: { baseURL: "http://127.0.0.1:3101", headless: true },
  webServer: {
    command: "npx next start -p 3101",
    url: "http://127.0.0.1:3101",
    reuseExistingServer: false,
    timeout: 60000,
  },
  reporter: "list",
});
