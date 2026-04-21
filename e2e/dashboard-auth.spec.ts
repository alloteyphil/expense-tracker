import fs from "node:fs";
import { expect, test } from "@playwright/test";

const storageStatePath = process.env.PLAYWRIGHT_AUTH_STATE_PATH ?? "./playwright/.auth/user.json";
const hasAuthState = fs.existsSync(storageStatePath);

test.describe("authenticated dashboard flows", () => {
  test.skip(!hasAuthState, "Set PLAYWRIGHT_AUTH_STATE_PATH to run authenticated E2E flows.");

  if (hasAuthState) {
    test.use({ storageState: storageStatePath });
  }

  test("delete transaction removes it from list and updates counts", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();

    // Create a uniquely identifiable transaction.
    const note = `e2e-${Date.now()}`;
    await page.getByLabel(/amount/i).fill("12.34");
    await page.getByLabel(/note \(optional\)/i).fill(note);
    await page.getByRole("button", { name: /^add transaction$/i }).click();

    await expect(page.getByText(note)).toBeVisible();

    // Delete the same transaction via row actions.
    const row = page.locator("tr").filter({ hasText: note });
    await row.getByRole("button", { name: /row actions/i }).click();
    await page.getByRole("menuitem", { name: /delete/i }).click();
    await page.getByRole("button", { name: /^delete$/i }).click();

    await expect(page.getByText(note)).toHaveCount(0);
  });
});
