import { afterEach, describe, expect, it } from "vitest";
import { parseServerEnv } from "@/lib/env";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";
import {
  AuthorizationError,
  OriginError,
  RateLimitError,
  assertActiveAdminSession,
  assertRateLimit,
  assertTrustedOrigin,
  publicErrorMessage,
  redactForLog,
  resetRateLimitStore,
  richTextParagraphs,
  sanitizeHref,
  sanitizeMailto,
  textToSanitizedDocument,
} from "@/lib/security";

const validEnv = {
  DATABASE_URL: "postgresql://127.0.0.1/sofia_round_table",
  BETTER_AUTH_SECRET: "ci-placeholder-secret-not-for-production-use",
  BETTER_AUTH_URL: "http://localhost:3000",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("environment validation", () => {
  it("accepts complete local configuration", () => {
    expect(parseServerEnv(validEnv).DATABASE_URL).toContain("postgresql://");
  });

  it("fails safely when required values are missing", () => {
    expect(() =>
      parseServerEnv({
        NODE_ENV: "production",
        DATABASE_URL: "",
        BETTER_AUTH_SECRET: "short",
      }),
    ).toThrow(/Invalid environment configuration/);
  });

  it("requires public URLs in production", () => {
    expect(() =>
      parseServerEnv({
        ...validEnv,
        NODE_ENV: "production",
        NEXT_PUBLIC_SITE_URL: undefined,
        BETTER_AUTH_URL: undefined,
      }),
    ).toThrow(/Invalid environment configuration/);
  });
});

describe("admin mutation authorization", () => {
  it("rejects mutations without a session", () => {
    expect(() => assertActiveAdminSession(null)).toThrow(AuthorizationError);
  });

  it("rejects mutations from a disabled account", () => {
    expect(() =>
      assertActiveAdminSession({
        user: {
          id: "admin-1",
          email: "admin@example.com",
          active: false,
        },
      }),
    ).toThrow(AuthorizationError);
  });

  it("keeps authorization server-owned and ignores client role claims", () => {
    const session = assertActiveAdminSession({
      user: {
        id: "admin-1",
        email: "admin@example.com",
        name: "Admin",
        active: true,
        role: "superadmin",
      },
    });

    expect(session.user).toEqual({
      id: "admin-1",
      email: "admin@example.com",
      name: "Admin",
    });
    expect(session.user).not.toHaveProperty("role");
  });
});

describe("trusted origins", () => {
  const trusted = [
    "http://localhost:3000",
    "https://sofia-round-table.narodnichitalishta.bg",
    "https://*.vercel.app",
  ];

  it("accepts configured origins and preview wildcards", () => {
    expect(() =>
      assertTrustedOrigin("http://localhost:3000", "localhost:3000", trusted),
    ).not.toThrow();
    expect(() =>
      assertTrustedOrigin(
        "https://preview-abc.vercel.app",
        "preview-abc.vercel.app",
        trusted,
      ),
    ).not.toThrow();
  });

  it("rejects untrusted origins even when a host is present", () => {
    expect(() =>
      assertTrustedOrigin("https://evil.example", "localhost:3000", trusted),
    ).toThrow(OriginError);
  });
});

describe("rate limits", () => {
  afterEach(() => {
    resetRateLimitStore();
  });

  it("blocks a key after the configured maximum", () => {
    assertRateLimit("sensitive:admin-1", { windowMs: 60_000, max: 2 });
    assertRateLimit("sensitive:admin-1", { windowMs: 60_000, max: 2 });
    expect(() =>
      assertRateLimit("sensitive:admin-1", { windowMs: 60_000, max: 2 }),
    ).toThrow(RateLimitError);
  });
});

describe("safe public output", () => {
  it("redacts secrets and personal data from logs", () => {
    expect(
      redactForLog(
        "Failed for maria.getova@narodnichitalishta.bg password=super-secret DATABASE_URL=postgresql://user:pass@host/db",
      ),
    ).toBe(
      "Failed for [redacted-email] password=[redacted] DATABASE_URL=[redacted]",
    );
  });

  it("hides stack traces and database errors from browsers", () => {
    expect(
      publicErrorMessage(
        new Error("Failed query: relation site_settings does not exist"),
        "Настройките не бяха запазени.",
      ),
    ).toBe("Настройките не бяха запазени.");
    expect(
      publicErrorMessage(new AuthorizationError(), "Запазете отново."),
    ).toBe("Нямате достъп. Влезте отново.");
  });

  it("keeps only safe hrefs and link protocols", () => {
    expect(sanitizeHref("#program")).toBe("#program");
    expect(sanitizeHref("/en")).toBe("/en");
    expect(sanitizeHref("https://narodnichitalishta.bg/")).toBe(
      "https://narodnichitalishta.bg/",
    );
    expect(sanitizeHref("javascript:alert(1)")).toBeNull();
    expect(sanitizeHref("data:text/html,hi")).toBeNull();
    expect(sanitizeMailto("team@example.com")).toBe("mailto:team@example.com");
    expect(sanitizeMailto("not-an-email")).toBeNull();
  });

  it("sanitizes stored rich text before rendering", () => {
    const document = textToSanitizedDocument(
      "Първи абзац\n\n<script>alert(1)</script>Втори",
    );
    expect(document.content.map((node) => node.text)).toEqual([
      "Първи абзац",
      "alert(1)Втори",
    ]);
    expect(
      richTextParagraphs({
        type: "doc",
        content: [
          { type: "paragraph", text: "<b>Hello</b>" },
          { type: "script", text: "alert(1)" },
        ],
      }),
    ).toEqual(["Hello"]);
  });
});

describe("security headers", () => {
  it("includes CSP, referrer, content-type, and frame protections", () => {
    const csp = contentSecurityPolicy({ isDev: false });
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("unsafe-eval");
    expect(contentSecurityPolicy({ isDev: true })).not.toContain(
      "upgrade-insecure-requests",
    );

    const keys = securityHeaders({ isDev: false }).map((header) => header.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "Content-Security-Policy",
        "Referrer-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
      ]),
    );
  });
});
