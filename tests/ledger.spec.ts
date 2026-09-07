import { test, expect } from "@playwright/test";
const routes = [
  "/",
  "/transactions",
  "/transactions/exp-1",
  "/analytics",
  "/budgets",
  "/categories",
  "/recurring",
  "/calendar",
  "/settings",
  "/more",
];
test("all routes render without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      "Something went wrong",
    );
  }
  expect(errors).toEqual([]);
});
for (const width of [320, 375, 390, 430, 768, 1024, 1440])
  test(`responsive routes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        route,
      ).toBeTruthy();
    }
    if (width < 768) {
      await expect(
        page.getByRole("navigation", { name: "Mobile navigation" }),
      ).toBeVisible();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("button", { name: "Add expense" })
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBeTruthy();
    }
  });
test("expense lifecycle updates shared views", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-amount")).toHaveText("₹1,284");
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .first()
    .click();
  await page.getByLabel("AMOUNT", { exact: true }).fill("250");
  await page.getByLabel("Merchant / paid to").fill("Test lunch");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Add expense", exact: true })
    .click();
  await expect(page.locator(".hero-amount")).toHaveText("₹1,534");
  await page.getByRole("link", { name: "Transactions", exact: true }).click();
  await page.getByLabel("Search transactions").fill("Test lunch");
  await page.getByRole("button", { name: /Test lunch/ }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("AMOUNT", { exact: true }).fill("350");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.locator(".transaction-amount")).toContainText("₹350");
  await page.getByRole("button", { name: /Test lunch/ }).click();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".transaction-row")).toHaveCount(2);
  await page.locator(".transaction-row").first().click();
  await page
    .getByRole("button", { name: "Delete expense", exact: true })
    .click();
  await page
    .locator("dialog[open]")
    .last()
    .getByRole("button", { name: "Delete expense", exact: true })
    .click();
  await expect(page.locator(".transaction-row")).toHaveCount(1);
});
test("keyboard search, dialog focus, and themes", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("textbox", { name: /Search (Finora|Ledger)/ })
    .fill("swiggy");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/transactions\/exp-/);
  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.keyboard.press("Control+k");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("budgets, recurring, categories, calendar and quick entry", async ({
  page,
}) => {
  await page.goto("/budgets");
  await page.getByRole("button", { name: "New budget" }).click();
  await page.getByLabel("Category", { exact: true }).selectOption("groceries");
  await page.getByLabel("Monthly limit").fill("9000");
  await page.getByRole("button", { name: "Save budget" }).click();
  await expect(
    page.locator(".budget-row").filter({ hasText: "Groceries" }),
  ).toContainText("₹9,000");
  await page.getByRole("link", { name: "Recurring", exact: true }).click();
  await page.getByRole("button", { name: "Pause Netflix" }).click();
  await expect(page.locator(".recurring-summary")).toContainText("₹1,417");
  await page.getByRole("link", { name: "Categories", exact: true }).click();
  await page.getByRole("button", { name: "New category" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Pets");
  await page.getByRole("button", { name: "Save category" }).click();
  await expect(
    page.locator(".category-tile").filter({ hasText: "Pets" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Calendar", exact: true }).click();
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(
    page.getByRole("heading", { name: "August 2026" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .first()
    .click();
  await page.getByLabel("Quick entry").fill("450 uber");
  await expect(page.getByLabel("AMOUNT", { exact: true })).toHaveValue("450");
  await expect(
    page.getByRole("button", { name: "Transport", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
