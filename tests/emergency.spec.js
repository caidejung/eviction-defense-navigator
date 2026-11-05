import { test, expect } from "@playwright/test";

test("all emergency guides, triage, keyboard navigation, and retained checklists", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "I Need Urgent Help", exact: true })
    .press("Enter");
  for (const [answer, title] of [
    ["court", "I received court papers"],
    ["sheriff", "I received a sheriff notice to vacate"],
    ["lockout", "I face a lockout or utility shutoff"],
    ["notice", "I received an eviction notice"],
  ]) {
    await page.locator("input[name=situation][value=" + answer + "]").check();
    await page.getByRole("button", { name: "Show next steps" }).click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(page.locator("main")).toBeFocused();
    await expect(
      page.getByText("Legal information only.", { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Contact legal aid now" }),
    ).toHaveAttribute("href", /^https:/);
    await page.getByRole("checkbox").first().check();
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.evaluate(() => innerWidth),
    );
    await page.getByRole("link", { name: "Change my situation" }).click();
  }
  await page
    .getByRole("link", { name: "I received court papers", exact: true })
    .click();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await page.getByRole("link", { name: "Change my situation" }).click();
  await page.getByLabel("I am unsure").check();
  await page.getByRole("button", { name: "Show next steps" }).click();
  await expect(page.getByRole("status")).toContainText(
    "identify your documents",
  );
});

test("optional preferences survive back navigation and unknown language stays clear", async ({
  page,
}) => {
  await page.goto("/#find");
  await page.getByLabel("City", { exact: true }).selectOption("Oakland");
  await expect(page.getByLabel("County")).toHaveValue("Alameda");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("Housing problem")
    .selectOption("Eviction notice received");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Type of help").selectOption("Legal representation");
  await page.getByLabel("Preferred language").selectOption("Spanish");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Preferred language")).toHaveValue("Spanish");
  await expect(page.getByLabel("Type of help")).toHaveValue(
    "Legal representation",
  );
  await page.getByRole("button", { name: "Show my resources" }).click();
  const provider = page
    .locator("article")
    .filter({ hasText: "East Bay Community Law Center" });
  await expect(provider).toContainText("Serves your city");
  await provider.getByText("Eligibility and availability").click();
  await expect(provider).toContainText("preferred language is unverified");
  await expect(
    page.getByText("Berkeley Housing Retention Program"),
  ).toHaveCount(0);
});

test("skip optional fields and conditional questions for deposits", async ({
  page,
}) => {
  await page.goto("/#find");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("Housing problem")
    .selectOption("Security deposit dispute");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Have you received")).toHaveCount(0);
  await page.getByRole("button", { name: "Show my resources" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Security deposit dispute",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Find free or low-cost legal help"),
  ).toBeVisible();
});

test("county outside pilot and privacy clearing", async ({ page }) => {
  await page.goto("/#find");
  await page.getByLabel("County").fill("Sacramento");
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("Housing problem")
    .selectOption("Other housing-related problems");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Show my resources" }).click();
  await expect(page.getByText(/No exact issue match/)).toBeVisible();
  await expect(page.getByText("East Bay Community Law Center")).toHaveCount(0);
  await page.getByRole("link", { name: "Privacy & disclaimer" }).click();
  await page.getByRole("button", { name: "Clear my answers" }).click();
  await page.getByRole("link", { name: "Your resources" }).click();
  await expect(
    page.getByRole("heading", { name: "Start with your situation." }),
  ).toBeVisible();
});

test("editing issue preserves unrelated preferences and checklist progress", async ({
  page,
}) => {
  await page.goto("/#find");
  await page.getByLabel("City", { exact: true }).selectOption("Berkeley");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Housing problem").selectOption("Unable to pay rent");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Preferred language").selectOption("Spanish");
  await page.getByRole("button", { name: "Show my resources" }).click();
  await page.getByRole("checkbox").first().check();
  await page.getByRole("checkbox").nth(1).check();
  await page.getByRole("link", { name: "Edit answers" }).click();
  await expect(page.getByLabel("City", { exact: true })).toHaveValue(
    "Berkeley",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByLabel("Housing problem")
    .selectOption("Court summons or eviction lawsuit");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Preferred language")).toHaveValue("Spanish");
  await page.getByRole("button", { name: "Show my resources" }).click();
  await expect(page.getByRole("checkbox").first()).toBeChecked();
  await expect(page.getByRole("checkbox").nth(1)).not.toBeChecked();
});
