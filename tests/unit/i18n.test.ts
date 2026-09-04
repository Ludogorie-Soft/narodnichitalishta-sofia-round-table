import { describe, expect, it } from "vitest";
import {
  dictionaries,
  getDictionary,
  getStatusLabel,
} from "@/lib/dictionaries";
import {
  isLocale,
  localeFromPathname,
  pickLocalized,
  publicPathForLocale,
} from "@/lib/i18n";

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

  it("maps locales to public paths", () => {
    expect(publicPathForLocale("bg")).toBe("/");
    expect(publicPathForLocale("en")).toBe("/en");
  });
});

describe("administrator-entered bilingual fields", () => {
  it("uses the English column only when it has content", () => {
    expect(pickLocalized("en", "Български", "English")).toEqual({
      value: "English",
      contentLocale: "en",
    });
  });

  it("falls back to Bulgarian instead of inventing English copy", () => {
    expect(pickLocalized("en", "Български", "  ")).toEqual({
      value: "Български",
      contentLocale: "bg",
    });
    expect(pickLocalized("en", "Български", null)).toEqual({
      value: "Български",
      contentLocale: "bg",
    });
  });

  it("keeps Bulgarian as the default locale selection", () => {
    expect(pickLocalized("bg", "Български", "English")).toEqual({
      value: "Български",
      contentLocale: "bg",
    });
  });
});

describe("typed locale dictionaries", () => {
  it("keeps the same UI keys for Bulgarian and English", () => {
    expect(Object.keys(dictionaries.bg).sort()).toEqual(
      Object.keys(dictionaries.en).sort(),
    );
    expect(Object.keys(dictionaries.bg.meta).sort()).toEqual(
      Object.keys(dictionaries.en.meta).sort(),
    );
    expect(Object.keys(dictionaries.bg.status).sort()).toEqual(
      Object.keys(dictionaries.en.status).sort(),
    );
  });

  it("returns language-specific status labels", () => {
    expect(getStatusLabel("bg", "to_be_confirmed")).toBe("За потвърждение");
    expect(getStatusLabel("en", "to_be_confirmed")).toBe("To be confirmed");
    expect(getDictionary("bg").header.registration).toBe("Регистрация");
    expect(getDictionary("en").header.registration).toBe("Registration");
    expect(getDictionary("bg").registration.prompt).toContain(
      "трябва да се регистрирате",
    );
    expect(getDictionary("en").registration.prompt).toContain("must register");
    expect(getDictionary("bg").registration.note).toContain("изчерпването");
    expect(getDictionary("en").registration.note).toContain("limited");
  });
});
