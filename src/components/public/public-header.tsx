import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { LanguageSwitcher } from "./language-switcher";
import { RegistrationButton } from "./registration-cta";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

const sectionLinks = [
  ["home", "#home"],
  ["about", "#about"],
  ["program", "#program"],
  ["organizers", "#organizers"],
] as const;

function NavigationLinks({
  locale,
  navigation,
}: {
  locale: Locale;
  navigation?: Array<{ label: string; href: string }>;
}) {
  const copy = getDictionary(locale).header;
  const links =
    navigation ??
    sectionLinks.map(([label, href]) => ({ label: copy[label], href }));

  return (
    <>
      {links.map(({ label, href }) => (
        <Link
          className="rounded px-2 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-conference-green"
          href={href}
          key={href}
        >
          {label}
        </Link>
      ))}
      <a
        className="rounded px-2 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:text-conference-green"
        href="https://narodnichitalishta.bg/"
        rel="noreferrer"
        target="_blank"
      >
        {copy.ecosystem}
        <span className="sr-only"> ({copy.opensInNewTab})</span>
      </a>
    </>
  );
}

export function PublicHeader({
  locale,
  navigation,
}: {
  locale: Locale;
  navigation?: Array<{ label: string; href: string }>;
}) {
  const copy = getDictionary(locale).header;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center gap-3 px-5 sm:gap-4 sm:px-8">
        <Link
          aria-label={copy.home}
          className="mr-auto rounded-sm"
          href="#home"
        >
          <BrandLogo alt={copy.logo} />
        </Link>

        <nav
          aria-label={copy.menu}
          className="hidden items-center gap-1 lg:flex"
        >
          <NavigationLinks locale={locale} navigation={navigation} />
        </nav>

        <div className="hidden sm:block">
          <RegistrationButton compact locale={locale} />
        </div>
        <LanguageSwitcher locale={locale} />

        <details className="group relative lg:hidden">
          <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-full border border-neutral-300 px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            {copy.menu}
          </summary>
          <nav
            aria-label={copy.menu}
            className="absolute right-0 top-12 flex w-64 flex-col rounded-xl border border-neutral-200 bg-white p-3 shadow-xl"
          >
            <NavigationLinks locale={locale} navigation={navigation} />
            <div className="mt-3 sm:hidden">
              <RegistrationButton locale={locale} />
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
