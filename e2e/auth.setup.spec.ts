import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const authStatePath =
  process.env.PLAYWRIGHT_AUTH_STATE_PATH ?? path.join("playwright", ".auth", "user.json");
const email = process.env.PLAYWRIGHT_TEST_EMAIL;
const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

test("bootstrap authenticated storage state", async ({ page, context }) => {
  test.skip(!email || !password, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD.");

  await page.goto("/sign-in");

  // Handle common Clerk sign-in field patterns.
  const emailInput = page.locator(
    'input[type="email"], input[name*="identifier"], input[name*="email"]',
  ).first();
  await emailInput.fill(email!);

  const passwordInput = page.locator('input[type="password"], input[name*="password"]').first();
  await passwordInput.fill(password!);

  await page.getByRole("button", { name: /continue|sign in|login/i }).first().click();

  await page.waitForURL(/dashboard|\/$/, { timeout: 20_000 });
  await expect(page).not.toHaveURL(/sign-in|login/);

  fs.mkdirSync(path.dirname(authStatePath), { recursive: true });
  await context.storageState({ path: authStatePath });
});
