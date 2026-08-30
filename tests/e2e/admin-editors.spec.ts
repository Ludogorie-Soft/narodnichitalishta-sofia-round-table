import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test.describe("authenticated admin editors", () => {
  test.skip(!email || !password, "E2E admin credentials are not configured.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Имейл").fill(email!);
    await page.getByLabel("Парола").fill(password!);
    await page.getByRole("button", { name: "Вход" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("previews unsaved bilingual general settings", async ({ page }) => {
    await page.goto("/admin/general");
    await page.getByLabel("Име").first().fill("Тестово място");
    await page.getByRole("button", { name: "Преглед преди запазване" }).click();
    await expect(page.getByText("Тестово място").last()).toBeVisible();
  });

  test("rejects a panel whose end time precedes its start", async ({
    page,
  }) => {
    await page.goto("/admin/schedule");
    await page.getByText("Добави нов ден").first().waitFor();
    const addPanel = page.getByText("Добави панел").first();
    await addPanel.click();
    const form = addPanel.locator("..").locator("form").first();
    await form.getByLabel("Начало").fill("11:00");
    await form.getByLabel("Край").fill("10:00");
    await form.getByRole("button", { name: "Запази и публикувай" }).click();
    await expect(form.getByRole("alert")).toContainText("преди началния");
  });
});
