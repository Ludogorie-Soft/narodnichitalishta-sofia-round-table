import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

type HeroContent = {
  title: string;
  subtitle: string;
  contentLocale?: Locale;
};

export function ConferenceHero({
  locale,
  hero,
}: {
  locale: Locale;
  hero?: HeroContent;
}) {
  const text = getDictionary(locale).hero;
  const title = hero?.title?.trim() || text.title;
  const subtitle = hero?.subtitle?.trim() || text.subtitle;
  const textLocale = hero?.contentLocale ?? locale;

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
        <div className="mt-5 max-w-4xl" lang={textLocale}>
          <h1 className="font-display text-2xl leading-tight font-semibold text-balance sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-white sm:text-lg">
            {subtitle}
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
