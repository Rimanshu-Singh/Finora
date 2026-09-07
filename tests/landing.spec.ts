import { test, expect } from "@playwright/test";

test("public landing, themes, mobile navigation, and auth destinations", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your money.Finally clear.");
  await expect(page.locator(".sidebar")).toHaveCount(0);
  await expect(page.locator(".landing-nav .landing-primary")).toHaveAttribute("href", "/sign-up");
  await expect(page.locator(".landing-signin")).toHaveAttribute("href", "/sign-in");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 390) {
      await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();
      await expect(page.getByRole("button", { name: "Open menu", exact: true })).toBeFocused();
    }
  }
  await page.screenshot({ path: "test-results/landing-light-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Toggle theme", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.screenshot({ path: "test-results/landing-dark-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/landing-dark-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});

test("dashboard remains protected for signed-out visitors", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/sign-in/);
});
