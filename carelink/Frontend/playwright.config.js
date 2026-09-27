import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  expect: { timeout: 10000 },
  workers: 1,
  use: { baseURL: "http://127.0.0.1:5173", channel: "chrome", headless: true, screenshot: "only-on-failure" },
  reporter: "list"
});
