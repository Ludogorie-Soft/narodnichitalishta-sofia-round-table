import { expect, test } from "@playwright/test";

test("skip link moves keyboard focus to main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Към основното съдържание" });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("Bulgarian and English pages expose language metadata", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/София 2026/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /localhost:3000\/?$/,
  );
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveAttribute("href", /\/en$/);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    1,
  );

  const jsonLd = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      "{}",
  ) as {
    "@type": string;
    location?: { name?: string; address?: { streetAddress?: string } };
  };
  expect(jsonLd["@type"]).toBe("Event");
  expect(jsonLd.location?.name).toBe("Дом на Европа");
  expect(jsonLd.location?.address?.streetAddress).toContain("Раковски");

  await page.goto("/en");
  await expect(page).toHaveTitle(/Sofia 2026/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("heading levels stay sequential on the public page", async ({ page }) => {
  await page.goto("/");
  const levels = await page
    .locator("h1, h2, h3, h4, h5, h6")
    .evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1))),
    );

  expect(levels[0]).toBe(1);
  for (let index = 1; index < levels.length; index += 1) {
    expect(levels[index]! - levels[index - 1]!).toBeLessThanOrEqual(1);
  }
});

test("robots and sitemap keep admin routes out of the index", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsBody = await robots.text();
  expect(robotsBody).toContain("Disallow: /admin");
  expect(robotsBody).toContain("Disallow: /api/auth");
  expect(robotsBody).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("/en");
  expect(sitemapBody).not.toContain("/admin");
});

test("legacy WordPress paths redirect permanently without loops", async ({
  page,
  request,
}) => {
  for (const path of ["/about-us", "/schedule"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(response.headers().location ?? "").not.toContain(path);
  }

  await page.goto("/about-us");
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator("#about")).toBeAttached();

  await page.goto("/about-us/");
  await expect(page).toHaveURL(/#about$/);

  await page.goto("/schedule");
  await expect(page).toHaveURL(/#program$/);
  await expect(page.locator("#program")).toBeAttached();

  await page.goto("/schedule/");
  await expect(page).toHaveURL(/#program$/);
});

test("admin routes send a noindex robots header", async ({ request }) => {
  const response = await request.get("/admin/login");
  expect(response.headers()["x-robots-tag"] ?? "").toMatch(/noindex/i);
});
