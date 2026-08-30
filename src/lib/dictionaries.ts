import type { ScheduleItemStatus } from "@/lib/datetime";
import type { Locale } from "@/lib/i18n";

export type Dictionary = {
  skip: string;
  meta: {
    title: string;
    description: string;
    ogAlt: string;
    siteName: string;
  };
  header: {
    menu: string;
    home: string;
    about: string;
    program: string;
    organizers: string;
    ecosystem: string;
    logo: string;
    opensInNewTab: string;
  };
  language: {
    switchTo: string;
    short: string;
  };
  hero: {
    title: string;
    subtitle: string;
    date: string;
    city: string;
    alt: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
  };
  program: {
    eyebrow: string;
    heading: string;
    chooseDay: string;
    timezone: string;
    noTime: string;
    translationPending: string;
    dayPrefix: string;
  };
  organizers: {
    eyebrow: string;
    heading: string;
    text: string;
  };
  venue: {
    eyebrow: string;
    heading: string;
    map: string;
  };
  footer: {
    logo: string;
    summary: string;
    copyright: string;
    links: string;
    contact: string;
  };
  status: Record<ScheduleItemStatus, string>;
  jsonLd: {
    organizerName: string;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  bg: {
    skip: "Към основното съдържание",
    meta: {
      title:
        "Културата като катализатор за местно и регионално развитие | София 2026",
      description:
        "Международна конференция: Културата като катализатор за местно и регионално развитие. София, 18–19 септември 2026.",
      ogAlt:
        "Банер на международната конференция Bridge makers, трета кръгла маса в София, 18–19 септември 2026",
      siteName: "Sofia Round Table 2026",
    },
    header: {
      menu: "Меню",
      home: "Начало",
      about: "За събитието",
      program: "Програма",
      organizers: "Организатори",
      ecosystem: "Народни читалища",
      logo: "Лого на Фондация „Народни читалища“",
      opensInNewTab: "отваря се в нов раздел",
    },
    language: {
      switchTo: "View this section in English",
      short: "EN",
    },
    hero: {
      title: "Културата като катализатор за местно и регионално развитие",
      subtitle: "От локални партньорства към по-широко европейско измерение.",
      date: "18–19 септември 2026",
      city: "София",
      alt: "Банер на международната конференция Bridge makers, трета кръгла маса в София, 18–19 септември 2026",
    },
    about: {
      eyebrow: "Bridge Makers · София",
      heading: "Въведение",
      paragraphs: [
        "Българските читалища навършват 170 години. Огромна мрежа от 3597 читалища, 80% от които в селските райони, която крие огромен потенциал — точно този потенциал, който „Културният компас за Европа“ на ЕС ни призовава да разгърнем: културата като двигател на сближаване, устойчивост и конкурентоспособност във всяка територия, не само в столиците. Докато българските градове подготвят своите кандидатури за Европейска столица на културата 2032, истинският въпрос е дали селските и периферните общности ще бъдат част от тази история — а именно читалищата са мястото, където тази култура се изгражда отдолу-нагоре, всеки ден. Тази кръгла маса събира евродепутати, кметове, представители на читалища, национални и местни власти, ENCC и експерти по Европейска столица на културата, за да постави местната култура отново в центъра на териториалната амбиция на Европа. Тя е трета от поредица от шест кръгли маси по програма „Bridge Makers“ на ENCC, след срещи в Чехия и Италия, като предстои и издание в Гърция.",
      ],
    },
    program: {
      eyebrow: "18 септември · Ден 1",
      heading: "Дневен ред",
      chooseDay: "Изберете ден",
      timezone: "Местно време",
      noTime: "Без точен час",
      translationPending: "Преводът предстои",
      dayPrefix: "Ден",
    },
    organizers: {
      eyebrow: "Партньорство",
      heading: "За организаторите",
      text: "Събитието се финансира от Столична община и се изпълнява по проект „Bridge Makers“ на ENCC, съфинансиран от Европейския съюз. То се реализира с домакинството и подкрепата на Бюрото за връзка на Европейския парламент в България.",
    },
    venue: {
      eyebrow: "Място",
      heading: "Място на провеждане",
      map: "Отворете картата",
    },
    footer: {
      logo: "Лого на Фондация „Народни читалища“",
      summary:
        "Фондация „Народни читалища“ подкрепя възраждането на българските читалища.",
      copyright: "Фондация „Народни читалища“ • 2026 • Всички права запазени",
      links: "Връзки",
      contact: "Контакт",
    },
    status: {
      confirmed: "Потвърдено",
      to_be_confirmed: "За потвърждение",
      cancelled: "Отменено",
    },
    jsonLd: {
      organizerName: "Фондация „Народни читалища“",
    },
  },
  en: {
    skip: "Skip to main content",
    meta: {
      title:
        "Culture as a Catalyst for Local and Regional Development | Sofia 2026",
      description:
        "International conference: Culture as a Catalyst for Local and Regional Development. Sofia, 18–19 September 2026.",
      ogAlt:
        "Banner for the Bridge makers international conference, third round table in Sofia, 18–19 September 2026",
      siteName: "Sofia Round Table 2026",
    },
    header: {
      menu: "Menu",
      home: "Home",
      about: "About",
      program: "Program",
      organizers: "Organizers",
      ecosystem: "Narodni Chitalishta",
      logo: "Narodni Chitalishta Foundation logo",
      opensInNewTab: "opens in a new tab",
    },
    language: {
      switchTo: "Вижте раздела на български",
      short: "BG",
    },
    hero: {
      title: "Culture as a Catalyst for Local and Regional Development",
      subtitle: "From Local Partnerships to a Broader European Dimension.",
      date: "18–19 September 2026",
      city: "Sofia",
      alt: "Banner for the Bridge makers international conference, third round table in Sofia, 18–19 September 2026",
    },
    about: {
      eyebrow: "Bridge Makers · Sofia",
      heading: "Introduction",
      paragraphs: [
        "Bulgarian community centers are celebrating their 170th anniversary. A vast network of 3,597 community centers, 80% of which are in rural areas, holds immense potential—precisely the potential that the EU’s “Cultural Compass for Europe” calls on us to unleash: culture as a driver of cohesion, sustainability, and competitiveness in every region, not just in the capitals. While Bulgarian cities are preparing their bids for the European Capital of Culture 2032, the real question is whether rural and peripheral communities will be part of this story—and it is precisely the community centers where this culture is built from the ground up, every day. This roundtable brings together Members of the European Parliament, mayors, representatives of community centers, national and local authorities, the ENCC, and experts on the European Capital of Culture to put local culture back at the center of Europe’s territorial ambition. It is the third in a series of six roundtables under the ENCC’s “Bridge Makers” program, following meetings in the Czech Republic and Italy, with an upcoming event in Greece.",
      ],
    },
    program: {
      eyebrow: "18 September · Day 1",
      heading: "Agenda",
      chooseDay: "Choose a day",
      timezone: "Local time",
      noTime: "Time to be confirmed",
      translationPending: "English translation pending",
      dayPrefix: "Day",
    },
    organizers: {
      eyebrow: "Partnership",
      heading: "About the Organizers",
      text: "The event is funded by the Sofia Municipality and is implemented as part of the ENCC’s “Bridge Makers” project, co-funded by the European Union. It is organized with the hosting and support of the European Parliament Liaison Office in Bulgaria.",
    },
    venue: {
      eyebrow: "Venue",
      heading: "Conference venue",
      map: "Open map",
    },
    footer: {
      logo: "Narodni Chitalishta Foundation logo",
      summary:
        "The “Narodni Chitalishta” Foundation was established in October 2023 with the mission to support the potential of community centers in Bulgaria.",
      copyright: "Narodni Chitalishta Foundation • 2026 • All rights reserved",
      links: "Links",
      contact: "Contact",
    },
    status: {
      confirmed: "Confirmed",
      to_be_confirmed: "To be confirmed",
      cancelled: "Cancelled",
    },
    jsonLd: {
      organizerName: "Narodni Chitalishta Foundation",
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function getStatusLabel(
  locale: Locale,
  status: ScheduleItemStatus,
): string {
  return dictionaries[locale].status[status];
}
