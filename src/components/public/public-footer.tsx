import type { ReactNode } from "react";
import { BrandLogo } from "./brand-logo";
import type { PublicSiteData } from "@/db/queries/public-site";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  if (isExternalHref(href)) {
    return (
      <a href={href} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  }

  return <a href={href}>{children}</a>;
}

export function PublicFooter({
  locale,
  navigation,
  settings,
}: {
  locale: Locale;
  navigation?: Array<{ label: string; href: string }>;
  settings?: PublicSiteData["settings"];
}) {
  const text = getDictionary(locale).footer;
  const opensInNewTab = getDictionary(locale).header.opensInNewTab;
  const links = [
    ...(navigation ?? []),
    {
      href: settings?.ngoHomeUrl ?? "https://narodnichitalishta.bg/",
      label: "narodnichitalishta.bg",
    },
    {
      href:
        settings?.chitalishtaMapUrl ?? "https://karta.narodnichitalishta.bg/",
      label: "karta.narodnichitalishta.bg",
    },
    {
      href: settings?.grantsUrl ?? "https://grantove.narodnichitalishta.bg/",
      label: "grantove.narodnichitalishta.bg",
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
                <FooterLink href={link.href}>
                  {link.label}
                  {isExternalHref(link.href) ? (
                    <span className="sr-only"> ({opensInNewTab})</span>
                  ) : null}
                </FooterLink>
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
                <FooterLink href={settings.facebookUrl}>
                  Facebook
                  <span className="sr-only"> ({opensInNewTab})</span>
                </FooterLink>
              </li>
            ) : null}
            {settings?.linkedinUrl ? (
              <li>
                <FooterLink href={settings.linkedinUrl}>
                  LinkedIn
                  <span className="sr-only"> ({opensInNewTab})</span>
                </FooterLink>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-black/10 px-5 py-5 text-center text-xs text-muted">
        {settings?.copyright || text.copyright}
      </div>
    </footer>
  );
}
