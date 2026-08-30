import { expect, test } from "@playwright/test";

test("Bulgarian home renders conference title", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "bg");
  await expect(
    page.getByRole("heading", {
      name: "Културата като катализатор за местно и регионално развитие",
    }),
  ).toBeVisible();
  await expect(page.locator("#about")).toBeAttached();
  await expect(page.locator("#program")).toBeAttached();
  await expect(page.locator("#organizers")).toBeAttached();
});

test("hero fits within a 13-inch laptop viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/");
  const hero = await page.locator("#home").boundingBox();

  expect(hero).not.toBeNull();
  expect(hero!.y + hero!.height).toBeLessThanOrEqual(768);
});

test("language switcher preserves the current section", async ({ page }) => {
  await page.goto("/#program");
  await expect(page).toHaveURL(/#program$/);
  const languageLink = page.getByRole("link", {
    name: "View this section in English",
  });
  await expect(languageLink).toHaveAttribute("href", "/en#program");
  await languageLink.click();
  await expect(page).toHaveURL(/\/en\/?#program$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", {
      name: "Culture as a Catalyst for Local and Regional Development",
    }),
  ).toBeVisible();
});

test("Bulgarian program renders both structured days", async ({ page }) => {
  await page.goto("/#program");
  await expect(
    page.getByRole("heading", {
      name: /ПАНЕЛ 1 — Диалог между местните власти/,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ден 2", exact: true }),
  ).toHaveAttribute("href", "#program-day-day-2026-09-19");
  await expect(page.getByText("За потвърждение").first()).toBeVisible();
  await expect(page.getByText("Юрий Вълковски")).toBeVisible();
});

test("English program identifies untranslated source entries", async ({
  page,
}) => {
  await page.goto("/en#program");
  await expect(
    page.getByText("English translation pending").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /ПАНЕЛ 2 — Ролята на читалищата/,
    }),
  ).toHaveAttribute("lang", "bg");
});

test("day navigation works from the keyboard", async ({ page }) => {
  await page.goto("/#program");
  const dayTwoLink = page.getByRole("link", { name: "Ден 2", exact: true });

  await dayTwoLink.focus();
  await expect(dayTwoLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#program-day-day-2026-09-19$/);
});

test("mobile navigation exposes the section links", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  await page.getByText("Меню", { exact: true }).click();
  await expect(
    page.getByRole("navigation", { name: "Меню" }).last(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Програма" }).last(),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
