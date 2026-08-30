import { BrandLogo } from "./brand-logo";
import type { PublicSiteData } from "@/db/queries/public-site";
import type { Locale } from "@/lib/i18n";

const copy = {
  bg: {
    logo: "Лого на Фондация „Народни читалища“",
    summary:
      "Фондация „Народни читалища“ подкрепя възраждането на българските читалища.",
    copyright: "Фондация „Народни читалища“ • 2026 • Всички права запазени",
    links: "Връзки",
    contact: "Контакт",
  },
  en: {
    logo: "Narodni Chitalishta Foundation logo",
    summary:
      "The “Narodni Chitalishta” Foundation was established in October 2023 with the mission to support the potential of community centers in Bulgaria.",
    copyright: "Narodni Chitalishta Foundation • 2026 • All rights reserved",
    links: "Links",
    contact: "Contact",
  },
} satisfies Record<Locale, Record<string, string>>;

export function PublicFooter({
  locale,
  navigation,
  settings,
}: {
  locale: Locale;
  navigation?: Array<{ label: string; href: string }>;
  settings?: PublicSiteData["settings"];
}) {
  const text = copy[locale];
  const links = [
    ...(navigation ?? []),
    {
      href: settings?.ngoHomeUrl ?? "https://narodnichitalishta.bg/",
      label: "Narodnichitalishta.bg",
    },
    {
      href:
        settings?.chitalishtaMapUrl ?? "https://karta.narodnichitalishta.bg/",
      label: "Karta.narodnichitalishta.bg",
    },
    {
      href: settings?.grantsUrl ?? "https://grantove.narodnichitalishta.bg/",
      label: "Grantove.narodnichitalishta.bg",
    },
  ].filter((link): link is { href: string; label: string } =>
    Boolean(link.href),
  );

  return (
    <footer className="border-t border-black/10 bg-neutral-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <BrandLogo alt={text.logo} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
            {settings?.footerBlurb || text.summary}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-conference-green">
            {text.links}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-conference-green">
            {text.contact}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {settings?.contactEmail ? (
              <li>
                <a href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>
              </li>
            ) : null}
            {settings?.facebookUrl ? (
              <li>
                <a href={settings.facebookUrl}>Facebook</a>
              </li>
            ) : null}
            {settings?.linkedinUrl ? (
              <li>
                <a href={settings.linkedinUrl}>LinkedIn</a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-black/10 px-5 py-5 text-center text-xs text-neutral-500">
        {settings?.copyright || text.copyright}
      </div>
    </footer>
  );
}
