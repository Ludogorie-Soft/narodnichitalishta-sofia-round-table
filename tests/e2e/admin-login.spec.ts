import { expect, test } from "@playwright/test";

test("admin area redirects anonymous users to login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("heading", { name: "Администрация" }),
  ).toBeVisible();
});

test("there is no public signup page", async ({ page }) => {
  const response = await page.goto("/sign-up");
  expect(response?.status()).toBe(404);
});
