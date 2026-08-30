import { ConferenceHero } from "./conference-hero";
import { ProgramSchedule } from "./program-schedule";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import { PartnerLogo, SectionHeading } from "./public-ui";
import { getPublicSiteData } from "@/db/queries/public-site";
import type { Locale } from "@/lib/i18n";
import { partnerBrandLogoByPartnerId } from "@/lib/partner-brand-logos";

const copy = {
  bg: {
    skip: "Към основното съдържание",
    aboutEyebrow: "Bridge Makers · София",
    aboutHeading: "Въведение",
    aboutParagraphs: [
      "Българските читалища навършват 170 години. Огромна мрежа от 3597 читалища, 80% от които в селските райони, която крие огромен потенциал — точно този потенциал, който „Културният компас за Европа“ на ЕС ни призовава да разгърнем: културата като двигател на сближаване, устойчивост и конкурентоспособност във всяка територия, не само в столиците. Докато българските градове подготвят своите кандидатури за Европейска столица на културата 2032, истинският въпрос е дали селските и периферните общности ще бъдат част от тази история — а именно читалищата са мястото, където тази култура се изгражда отдолу-нагоре, всеки ден. Тази кръгла маса събира евродепутати, кметове, представители на читалища, национални и местни власти, ENCC и експерти по Европейска столица на културата, за да постави местната култура отново в центъра на териториалната амбиция на Европа. Тя е трета от поредица от шест кръгли маси по програма „Bridge Makers“ на ENCC, след срещи в Чехия и Италия, като предстои и издание в Гърция.",
    ],
    programEyebrow: "18 септември · Ден 1",
    programHeading: "Дневен ред",
    organizersEyebrow: "Партньорство",
    organizersHeading: "За организаторите",
    organizersText:
      "Събитието се финансира от Столична община и се изпълнява по проект „Bridge Makers“ на ENCC, съфинансиран от Европейския съюз. То се реализира с домакинството и подкрепата на Бюрото за връзка на Европейския парламент в България.",
    venueEyebrow: "Място",
    venueHeading: "Място на провеждане",
    map: "Отворете картата",
  },
  en: {
    skip: "Skip to main content",
    aboutEyebrow: "Bridge Makers · Sofia",
    aboutHeading: "Introduction",
    aboutParagraphs: [
      "Bulgarian community centers are celebrating their 170th anniversary. A vast network of 3,597 community centers, 80% of which are in rural areas, holds immense potential—precisely the potential that the EU’s “Cultural Compass for Europe” calls on us to unleash: culture as a driver of cohesion, sustainability, and competitiveness in every region, not just in the capitals. While Bulgarian cities are preparing their bids for the European Capital of Culture 2032, the real question is whether rural and peripheral communities will be part of this story—and it is precisely the community centers where this culture is built from the ground up, every day. This roundtable brings together Members of the European Parliament, mayors, representatives of community centers, national and local authorities, the ENCC, and experts on the European Capital of Culture to put local culture back at the center of Europe’s territorial ambition. It is the third in a series of six roundtables under the ENCC’s “Bridge Makers” program, following meetings in the Czech Republic and Italy, with an upcoming event in Greece.",
    ],
    programEyebrow: "18 September · Day 1",
    programHeading: "Agenda",
    organizersEyebrow: "Partnership",
    organizersHeading: "About the Organizers",
    organizersText:
      "The event is funded by the Sofia Municipality and is implemented as part of the ENCC’s “Bridge Makers” project, co-funded by the European Union. It is organized with the hosting and support of the European Parliament Liaison Office in Bulgaria.",
    venueEyebrow: "Venue",
    venueHeading: "Conference venue",
    map: "Open map",
  },
} satisfies Record<Locale, Record<string, unknown>>;

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
  const text = copy[locale];
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
      : text.aboutParagraphs;
  const organizerParagraphs = [
    ...(organizers?.paragraphs ?? []),
    ...(funding?.paragraphs ?? [text.organizersText]),
  ];

  return (
    <>
      <a
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded bg-white px-4 py-3 font-semibold text-conference-green shadow-lg transition-transform focus:translate-y-0"
        href="#main-content"
      >
        {text.skip}
      </a>
      <PublicHeader locale={locale} navigation={data.navigation} />
      <main id="main-content">
        <ConferenceHero hero={heroContent} locale={locale} />

        <section
          className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28"
          id="about"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.aboutEyebrow}>
              {introduction?.heading || text.aboutHeading}
            </SectionHeading>
            <div
              className="mt-8 max-w-4xl space-y-6 text-lg leading-relaxed text-neutral-700"
              lang={introduction?.contentLocale}
            >
              {introductionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-28 bg-neutral-50 px-5 py-20 sm:px-8 sm:py-28"
          id="program"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.programEyebrow}>
              {text.programHeading}
            </SectionHeading>
            <ProgramSchedule
              days={data.schedule}
              locale={locale}
              timezone={data.settings.timezone}
            />
          </div>
        </section>

        <section
          className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28"
          id="organizers"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.organizersEyebrow}>
              {organizers?.heading || text.organizersHeading}
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
          </div>
        </section>

        {data.settings.venuePublished &&
        (data.settings.venueName || data.settings.venueAddress) ? (
          <section
            className="scroll-mt-28 bg-neutral-50 px-5 py-20 sm:px-8 sm:py-28"
            id="venue"
          >
            <div className="mx-auto w-full max-w-6xl">
              <SectionHeading eyebrow={text.venueEyebrow}>
                {text.venueHeading}
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
                      {text.map}
                    </a>
                  </p>
                ) : null}
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
