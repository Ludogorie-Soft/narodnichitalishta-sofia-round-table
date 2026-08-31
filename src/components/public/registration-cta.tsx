import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";
import { REGISTRATION_URL } from "@/lib/registration";

export function RegistrationButton({
  locale,
  compact = false,
}: {
  locale: Locale;
  compact?: boolean;
}) {
  const copy = getDictionary(locale);

  return (
    <a
      className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full bg-conference-orange font-bold text-white shadow-sm transition-colors hover:bg-conference-orange-dark ${
        compact ? "px-3 text-sm" : "px-4 text-sm"
      }`}
      href={REGISTRATION_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      {copy.header.registration}
      <span className="sr-only"> ({copy.header.opensInNewTab})</span>
    </a>
  );
}

export function RegistrationNotice({ locale }: { locale: Locale }) {
  const copy = getDictionary(locale);

  return (
    <p className="max-w-4xl text-base leading-relaxed text-neutral-800 sm:text-lg">
      {copy.registration.prompt}{" "}
      <a
        className="break-all font-semibold text-conference-green underline underline-offset-4"
        href={REGISTRATION_URL}
        rel="noopener noreferrer"
        target="_blank"
      >
        {REGISTRATION_URL}
        <span className="sr-only"> ({copy.header.opensInNewTab})</span>
      </a>
    </p>
  );
}
