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

test.describe("authenticated application flows", () => {
  test.use({
    extraHTTPHeaders: {
      "x-test-bypass-auth": "finora-test-secret",
    },
  });

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
  await page.route("**/api/ai/quick-entry", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          amount: 450,
          category: "Transport",
          merchant: "Uber",
          description: "Uber ride",
          date: null,
        },
      }),
    });
  });
  await page.getByLabel("Quick entry").fill("450 uber");
  await page.getByRole("button", { name: "QUICK ENTRY" }).click();
  await expect(page.getByLabel("AMOUNT", { exact: true })).toHaveValue("450");
  await expect(
    page.getByRole("button", { name: "Transport", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Merchant / paid to")).toHaveValue("Uber");
});

test("quick entry populates payment method cash, date 5 sep, and expands more details for note/time", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .first()
    .click();

  await page.route("**/api/ai/quick-entry", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          amount: 500,
          category: "Groceries",
          merchant: null,
          description: null,
          date: "2026-09-05",
          time: "19:30",
          paymentMethod: "Cash",
          tags: ["weekend"],
          note: "team celebration",
          location: "Park Street",
          split: 2,
        },
      }),
    });
  });

  await page
    .getByLabel("Quick entry")
    .fill("500 in groceries 5 sep with cash 7:30pm note team celebration");
  await page.getByRole("button", { name: "QUICK ENTRY" }).click();

  await expect(page.getByLabel("AMOUNT", { exact: true })).toHaveValue("500");
  await expect(
    page.getByRole("button", { name: "Groceries", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Date")).toHaveValue("2026-09-05");
  await expect(page.getByLabel("Payment method")).toHaveValue("Cash");

  // Advanced fields section should have expanded automatically
  await expect(page.locator(".advanced-fields")).toBeVisible();
  await expect(page.getByLabel("Time")).toHaveValue("19:30");
  await expect(page.getByPlaceholder("Anything to remember?")).toHaveValue(
    "team celebration",
  );
  await expect(page.getByLabel("Location")).toHaveValue("Park Street");
  await expect(page.getByLabel("Split between")).toHaveValue("2");
});

test("quick entry failure gracefully shows inline error and preserves form", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .first()
    .click();

  await page.route("**/api/ai/quick-entry", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: "Quick Entry isn't available right now. You can still enter the expense manually.",
      }),
    });
  });

  await page.getByLabel("Quick entry").fill("invalid text");
  await page.getByRole("button", { name: "QUICK ENTRY" }).click();

  await expect(page.locator(".quick-entry-error")).toContainText(
    "Quick Entry isn't available right now",
  );
  // Form remains open and editable manually
  await page.getByLabel("AMOUNT", { exact: true }).fill("500");
  await page.getByRole("button", { name: "Food", exact: true }).click();
  await expect(page.getByLabel("AMOUNT", { exact: true })).toHaveValue("500");
});

test("dashboard displays dynamic greeting and live IST clock", async ({
  page,
}) => {
  await page.goto("/");
  const dateLine = page.locator(".date-line");
  await expect(dateLine).toBeVisible();

  // Matches uppercase date + IST + HH:mm:ss format
  await expect(dateLine).toHaveText(
    /[A-Z]+,\s+\d{1,2}\s+[A-Z]+\s+\d{4}\s+·\s+IST\s+·\s+\d{2}:\d{2}:\d{2}/,
  );

  // Matches greeting according to period - verifying every first letter after Good is capital
  const headerHeading = page.locator(".overview-header h1");
  await expect(headerHeading).toHaveText(
    /Good (Morning|Afternoon|Evening|Night),\s+Rimanshu\./,
  );
  const headingText = (await headerHeading.textContent()) ?? "";
  expect(headingText).toMatch(/^Good (Morning|Afternoon|Evening|Night)/);

  // Subtitle remains
  const subtitle = page.locator(".overview-header p");
  await expect(subtitle).toHaveText("A clear view of your everyday.");

  // Verify clock updates live
  const initialText = await dateLine.innerText();
  await page.waitForTimeout(1100);
  const updatedText = await dateLine.innerText();
  expect(updatedText).not.toEqual(initialText);
});
});

test.describe("unauthenticated authentication flows", () => {
  test("unauthenticated user accessing protected routes is redirected to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/sign-in/);
    expect(page.url()).toContain("/sign-in");

    await expect(page.locator(".auth-brand-header .brand")).toBeVisible();
    await expect(page.locator(".auth-tagline")).toHaveText(
      "Personal finance, thoughtfully.",
    );
  });

  test("sign-in and sign-up routes render Finora branding and Clerk containers", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await expect(page.locator(".auth-brand-header .brand")).toBeVisible();
    await expect(page.locator(".auth-tagline")).toBeVisible();
    await expect(page.locator(".cl-rootBox")).toBeVisible();

    await page.goto("/sign-up");
    await expect(page.locator(".auth-brand-header .brand")).toBeVisible();
    await expect(page.locator(".auth-tagline")).toBeVisible();
    await expect(page.locator(".cl-rootBox")).toBeVisible();
  });
});



