import { ConferenceHero } from "./conference-hero";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";
import { Callout, PartnerLogo, SectionHeading, StatusBadge } from "./public-ui";
import type { Locale } from "@/lib/i18n";

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
    programTitle: "Проект на програма",
    statusIntro: "Статусите ще се показват последователно:",
    organizersEyebrow: "Партньорство",
    organizersHeading: "За организаторите",
    organizersText:
      "Събитието се финансира от Столична община и се изпълнява по проект „Bridge Makers“ на ENCC, съфинансиран от Европейския съюз. То се реализира с домакинството и подкрепата на Бюрото за връзка на Европейския парламент в България.",
    logos: {
      encc: "Лого на Европейската мрежа на културните центрове (ENCC)",
      sofia: "Герб на Столична община",
      parliament: "Лого на Европейския парламент",
    },
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
    programTitle: "Draft Program",
    statusIntro: "Statuses will be presented consistently:",
    organizersEyebrow: "Partnership",
    organizersHeading: "About the Organizers",
    organizersText:
      "The event is funded by the Sofia Municipality and is implemented as part of the ENCC’s “Bridge Makers” project, co-funded by the European Union. It is organized with the hosting and support of the European Parliament Liaison Office in Bulgaria.",
    logos: {
      encc: "European Network of Cultural Centres (ENCC) logo",
      sofia: "Coat of arms of Sofia Municipality",
      parliament: "European Parliament logo",
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;

export function ConferencePage({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <>
      <a
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded bg-white px-4 py-3 font-semibold text-conference-green shadow-lg transition-transform focus:translate-y-0"
        href="#main-content"
      >
        {text.skip}
      </a>
      <PublicHeader locale={locale} />
      <main id="main-content">
        <ConferenceHero locale={locale} />

        <section
          className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28"
          id="about"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.aboutEyebrow}>
              {text.aboutHeading}
            </SectionHeading>
            <div className="mt-8 max-w-4xl space-y-6 text-lg leading-relaxed text-neutral-700">
              {text.aboutParagraphs.map((paragraph) => (
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
            <div className="mt-10">
              <Callout title={text.programTitle}>
                <p>{text.statusIntro}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <StatusBadge locale={locale} status="confirmed" />
                  <StatusBadge locale={locale} status="to_be_confirmed" />
                  <StatusBadge locale={locale} status="cancelled" />
                </div>
              </Callout>
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-28 px-5 py-20 sm:px-8 sm:py-28"
          id="organizers"
        >
          <div className="mx-auto w-full max-w-6xl">
            <SectionHeading eyebrow={text.organizersEyebrow}>
              {text.organizersHeading}
            </SectionHeading>
            <p className="mt-8 max-w-4xl text-lg leading-relaxed text-neutral-700">
              {text.organizersText}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
              <PartnerLogo
                alt={text.logos.encc}
                height={922}
                src="/brand/encc-logo.png"
                width={1536}
              />
              <PartnerLogo
                alt={text.logos.sofia}
                height={170}
                src="/brand/sofia-municipality-crest.jpg"
                width={150}
              />
              <PartnerLogo
                alt={text.logos.parliament}
                height={1076}
                src="/brand/european-parliament-logo.png"
                width={1365}
              />
            </div>
          </div>
        </section>
      </main>
      <PublicFooter locale={locale} />
    </>
  );
}
