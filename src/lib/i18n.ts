export const locales = ["bg", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "bg";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function localeFromPathname(pathname: string): Locale {
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return "en";
  }
  return "bg";
}

export function publicPathForLocale(locale: Locale): "/" | "/en" {
  return locale === "en" ? "/en" : "/";
}

/**
 * Administrator-entered copy lives in explicit `*Bg` / `*En` database
 * fields. UI chrome uses typed locale dictionaries. Never pass an arbitrary
 * language string when selecting between those columns.
 */
export function pickLocalized(
  locale: Locale,
  bg: string | null | undefined,
  en: string | null | undefined,
): { value: string | null; contentLocale: Locale } {
  if (locale === "en" && en?.trim()) {
    return { value: en, contentLocale: "en" };
  }
  return { value: bg?.trim() || null, contentLocale: "bg" };
}
