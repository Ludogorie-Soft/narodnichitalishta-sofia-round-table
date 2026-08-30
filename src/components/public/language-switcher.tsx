"use client";

import { useSyncExternalStore } from "react";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale).language;
  const target = locale === "bg" ? "/en" : "/";
  const label = copy.short;
  const accessibleLabel = copy.switchTo;
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => "",
  );

  return (
    <a
      aria-label={accessibleLabel}
      className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-conference-green px-3 text-sm font-bold text-conference-green transition-colors hover:bg-conference-green hover:text-white"
      href={`${target}${hash}`}
      hrefLang={locale === "bg" ? "en" : "bg"}
    >
      {label}
    </a>
  );
}
