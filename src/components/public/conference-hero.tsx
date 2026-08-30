import Image from "next/image";
import type { Locale } from "@/lib/i18n";

const copy = {
  bg: {
    title: "Културата като катализатор за местно и регионално развитие",
    subtitle: "От локални партньорства към по-широко европейско измерение",
    date: "18–19 септември 2026",
    city: "София",
    alt: "Банер на международната конференция Bridge makers, трета кръгла маса в София, 18–19 септември 2026",
  },
  en: {
    title: "Culture as a Catalyst for Local and Regional Development",
    subtitle: "From Local Partnerships to a Broader European Dimension",
    date: "18–19 September 2026",
    city: "Sofia",
    alt: "Banner for the Bridge makers international conference, third round table in Sofia, 18–19 September 2026",
  },
} satisfies Record<Locale, Record<string, string>>;

export function ConferenceHero({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <section
      className="scroll-mt-28 overflow-hidden bg-conference-green text-white"
      id="home"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-6 text-center sm:px-8 sm:py-8">
        <div className="w-full max-w-[720px] overflow-hidden rounded-xl bg-white shadow-xl shadow-black/20">
          <Image
            alt={text.alt}
            className="h-auto w-full"
            height={480}
            priority
            sizes="(min-width: 768px) 720px, 100vw"
            src="/brand/hero-bridge-makers.png"
            width={1056}
          />
        </div>
        <div className="mt-5 max-w-4xl">
          <h1 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-3xl lg:text-4xl">
            {text.title}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-white/80 sm:text-lg">
            {text.subtitle}
          </p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-base font-bold sm:text-lg">
            <span>{text.date}</span>
            <span aria-hidden="true" className="text-conference-pink">
              /
            </span>
            <span>{text.city}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
