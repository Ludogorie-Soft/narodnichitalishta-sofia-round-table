import { expect, test } from "@playwright/test";

test("Bulgarian home renders conference title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "bg");
  await expect(
    page.getByRole("heading", { name: "Международна конференция" }),
  ).toBeVisible();
});

test("English home is reachable from the language link", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "International conference" }),
  ).toBeVisible();
});
