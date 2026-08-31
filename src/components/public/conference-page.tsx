import { ConferenceHero } from "./conference-hero";
import { EventJsonLd } from "./event-json-ld";
import { ProgramSchedule } from "./program-schedule";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import { PartnerLogo, SectionHeading } from "./public-ui";
import { RegistrationNotice } from "./registration-cta";
import { SkipLink } from "@/components/ui/skip-link";
import { getPublicSiteData } from "@/db/queries/public-site";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { publicPathForLocale } from "@/lib/i18n";
import { partnerBrandLogoByPartnerId } from "@/lib/partner-brand-logos";
import { absoluteUrl, buildEventJsonLd, CONFERENCE_OG_IMAGE } from "@/lib/seo";

function fallbackPartnerImage(id: string, locale: Locale) {
  const brandLogo = partnerBrandLogoByPartnerId(id);
  if (!brandLogo) return null;
  const alt = locale === "bg" ? brandLogo.altBg : brandLogo.altEn;
  return {
    src: brandLogo.src,
    width: brandLogo.width,
    height: brandLogo.height,
    alt,
  };
}

export async function ConferencePage({ locale }: { locale: Locale }) {
  const text = getDictionary(locale);
  const data = await getPublicSiteData(locale);
  const hero = data.sections.hero;
  const heroContent = hero
    ? (() => {
        const isLegacyHeading =
          hero.heading === "МЕЖДУНАРОДНА КОНФЕРЕНЦИЯ" ||
          hero.heading === "INTERNATIONAL CONFERENCE";
        if (isLegacyHeading && hero.paragraphs.length >= 2) {
          return {
            title: hero.paragraphs[0] ?? "",
            subtitle: hero.paragraphs[1] ?? "",
            contentLocale: hero.contentLocale,
          };
        }
        return {
          title: hero.heading ?? "",
          subtitle: hero.paragraphs[0] ?? "",
          contentLocale: hero.contentLocale,
        };
      })()
    : undefined;
  const introduction = data.sections.introduction;
  const organizers = data.sections.organizers;
  const funding = data.sections.funding;
  const introductionParagraphs =
    introduction && introduction.paragraphs.length > 0
      ? introduction.paragraphs
      : text.about.paragraphs;
  const organizerParagraphs = [
    ...(organizers?.paragraphs ?? []),
    ...(funding?.paragraphs ?? [text.organizers.text]),
  ];
  const eventName = heroContent?.title?.trim() || text.hero.title;
  const eventDescription = introductionParagraphs[0] ?? text.meta.description;
  const jsonLd = buildEventJsonLd({
    locale,
    name: eventName,
    description: eventDescription,
    startDate: data.settings.startDate,
    endDate: data.settings.endDate,
    city: data.settings.city,
    imageUrl: absoluteUrl(CONFERENCE_OG_IMAGE.path),
    pageUrl: absoluteUrl(publicPathForLocale(locale)),
    organizerName: text.jsonLd.organizerName,
    organizerUrl: data.settings.ngoHomeUrl,
    venuePublished: data.settings.venuePublished,
    venueName: data.settings.venueName,
    venueAddress: data.settings.venueAddress,
  });

  return (
    <>
      <EventJsonLd data={jsonLd} />
      <SkipLink>{text.skip}</SkipLink>
      <PublicHeader locale={locale} navigation={data.navigation} />
      <main id="main-content" tabIndex={-1}>
        <ConferenceHero hero={heroContent} locale={locale} />

        <div className="border-b border-conference-orange/25 bg-conference-orange-soft px-5 py-5 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <RegistrationNotice locale={locale} />
          </div>
        </div>

        <section
          className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28"
          id="about"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.about.eyebrow}>
              {introduction?.heading || text.about.heading}
            </SectionHeading>
            <div
              className="mt-8 max-w-4xl space-y-6 text-lg leading-relaxed text-neutral-700"
              lang={introduction?.contentLocale}
            >
              {introductionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-10">
              <RegistrationNotice locale={locale} />
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-28 bg-neutral-50 px-5 py-20 sm:px-8 sm:py-28"
          id="program"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.program.eyebrow}>
              {text.program.heading}
            </SectionHeading>
            <ProgramSchedule
              days={data.schedule}
              locale={locale}
              timezone={data.settings.timezone}
            />
            <div className="mt-10">
              <RegistrationNotice locale={locale} />
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28"
          id="organizers"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.organizers.eyebrow}>
              {organizers?.heading || text.organizers.heading}
            </SectionHeading>
            <div
              className="mt-8 max-w-4xl space-y-6 text-lg leading-relaxed text-neutral-700"
              lang={organizers?.contentLocale}
            >
              {organizerParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {data.partners.map((partner) => {
                const fallback = fallbackPartnerImage(partner.id, locale);
                const image = partner.image
                  ? {
                      src: partner.image.url,
                      width: partner.image.width ?? 800,
                      height: partner.image.height ?? 400,
                      alt: partner.image.alt,
                    }
                  : fallback;
                const logo = image ? (
                  <PartnerLogo {...image} />
                ) : (
                  <div className="flex min-h-32 items-center justify-center rounded-xl border border-neutral-200 p-5 text-center font-semibold">
                    {partner.name}
                  </div>
                );

                return partner.url ? (
                  <a
                    aria-label={partner.name}
                    href={partner.url}
                    key={partner.id}
                  >
                    {logo}
                  </a>
                ) : (
                  <div key={partner.id}>{logo}</div>
                );
              })}
            </div>
            <div className="mt-10">
              <RegistrationNotice locale={locale} />
            </div>
          </div>
        </section>

        {data.settings.venuePublished &&
        (data.settings.venueName || data.settings.venueAddress) ? (
          <section
            className="scroll-mt-28 bg-neutral-50 px-5 py-20 sm:px-8 sm:py-28"
            id="venue"
          >
            <div className="mx-auto w-full max-w-6xl">
              <SectionHeading eyebrow={text.venue.eyebrow}>
                {text.venue.heading}
              </SectionHeading>
              <div className="mt-8 text-lg leading-relaxed">
                {data.settings.venueName ? (
                  <p className="font-semibold">{data.settings.venueName}</p>
                ) : null}
                {data.settings.venueAddress ? (
                  <p>{data.settings.venueAddress}</p>
                ) : null}
                {data.settings.mapUrl ? (
                  <p className="mt-4">
                    <a
                      className="font-semibold text-conference-green underline underline-offset-4"
                      href={data.settings.mapUrl}
                    >
                      {text.venue.map}
                    </a>
                  </p>
                ) : null}
              </div>
              <div className="mt-10">
                <RegistrationNotice locale={locale} />
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <PublicFooter
        locale={locale}
        navigation={data.navigation}
        settings={data.settings}
      />
    </>
  );
}
