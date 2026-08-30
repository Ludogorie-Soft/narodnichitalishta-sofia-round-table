import { describe, expect, it } from "vitest";
import { isLocale, localeFromPathname } from "@/lib/i18n";

describe("locale helpers", () => {
  it("accepts only typed locales", () => {
    expect(isLocale("bg")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("BG")).toBe(false);
  });

  it("maps public pathnames to locales", () => {
    expect(localeFromPathname("/")).toBe("bg");
    expect(localeFromPathname("/#program")).toBe("bg");
    expect(localeFromPathname("/en")).toBe("en");
    expect(localeFromPathname("/en/")).toBe("en");
    expect(localeFromPathname("/admin/login")).toBe("bg");
  });
});
