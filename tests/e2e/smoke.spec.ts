import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("Home page loads successfully without 500 errors and renders dashboard UI", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(500);

    // Verify app mark and branding appear
    await expect(page.locator("body")).toContainText("Fan Dashboard");
    await expect(page.locator("body")).not.toContainText("Internal Server Error");

    // Check navigation items or top competitions section
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("Competition detail page (/competitions/PL) loads without 500 errors and renders competition data", async ({ page }) => {
    const response = await page.goto("/competitions/PL");
    expect(response?.status()).toBeLessThan(500);

    await expect(page.locator("body")).not.toContainText("Internal Server Error");

    // Check for tabs or table content if database is seeded or empty state if unseeded
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
    await expect(page.locator("body")).toContainText(/Premier League|Competitions|Standings/i);
  });
});
