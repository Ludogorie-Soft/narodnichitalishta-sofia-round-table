import { expect, test } from "@playwright/test";

test("public responses include security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);

  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["content-security-policy"] ?? "").toMatch(
    /frame-ancestors 'none'/,
  );
});

test("upload mutation requires an authenticated session", async ({
  request,
}) => {
  const response = await request.post("/api/blob/upload");
  expect(response.status()).toBe(401);

  const body = await response.text();
  expect(body).not.toMatch(/stack|postgres|BETTER_AUTH|DATABASE_URL/i);
  expect(JSON.parse(body)).toEqual({ error: "Unauthorized." });
});

test("upload mutation rejects an untrusted origin", async ({ request }) => {
  const response = await request.post("/api/blob/upload", {
    headers: { origin: "https://evil.example" },
  });
  expect(response.status()).toBe(403);
  expect(await response.json()).toEqual({ error: "Forbidden." });
});
