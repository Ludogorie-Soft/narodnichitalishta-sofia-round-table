import { BrandLogo } from "./brand-logo";
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

export function PublicFooter({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <footer className="border-t border-black/10 bg-neutral-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div>
          <BrandLogo alt={text.logo} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">
            {text.summary}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-conference-green">
            {text.links}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="https://narodnichitalishta.bg/">Narodnichitalishta.bg</a>
            </li>
            <li>
              <a href="https://karta.narodnichitalishta.bg/">
                Karta.narodnichitalishta.bg
              </a>
            </li>
            <li>
              <a href="https://grantove.narodnichitalishta.bg/">
                Grantove.narodnichitalishta.bg
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-conference-green">
            {text.contact}
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="mailto:info@narodnichitalishta.bg">
                info@narodnichitalishta.bg
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/narodnichitalishta/?locale=bg_BG">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/narodni-chitalishta-foundation/">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-black/10 px-5 py-5 text-center text-xs text-neutral-500">
        {text.copyright}
      </div>
    </footer>
  );
}
