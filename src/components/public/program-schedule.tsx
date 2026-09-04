import { StatusBadge } from "./public-ui";
import type {
  PublicScheduleDay,
  PublicScheduleItem,
  PublicSchedulePanel,
} from "@/db/queries/public-site";
import { formatConferenceDate } from "@/lib/datetime";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/lib/i18n";

function timeToMinutes(time: string | null): number {
  if (!time) {
    return -1;
  }
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function formatTime(item: PublicScheduleItem, locale: Locale): string {
  if (!item.startTime) {
    return getDictionary(locale).program.noTime;
  }
  return item.endTime
    ? `${item.startTime.slice(0, 5)}–${item.endTime.slice(0, 5)}`
    : item.startTime.slice(0, 5);
}

const itemStyles: Partial<Record<PublicScheduleItem["type"], string>> = {
  break: "border-conference-pink bg-conference-green-soft",
  lunch: "border-conference-pink bg-conference-green-soft",
  registration: "border-conference-green bg-white",
  visit: "border-conference-green bg-conference-green-soft",
};

function ScheduleItem({
  headingLevel = 4,
  item,
  locale,
}: {
  headingLevel?: 4 | 5;
  item: PublicScheduleItem;
  locale: Locale;
}) {
  const Heading = headingLevel === 4 ? "h4" : "h5";

  return (
    <li
      className={`grid gap-3 border-l-4 p-4 sm:grid-cols-[7rem_1fr] sm:gap-5 sm:p-5 ${
        itemStyles[item.type] ?? "border-neutral-200 bg-white"
      } ${item.status === "cancelled" ? "opacity-70" : ""}`}
    >
      <p className="font-display text-lg font-bold text-conference-green tabular-nums">
        {formatTime(item, locale)}
      </p>
      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Heading
            className={`font-display text-lg leading-snug font-semibold ${
              item.status === "cancelled" ? "line-through" : ""
            }`}
            lang={item.contentLocale}
          >
            {item.title}
          </Heading>
          {item.status !== "confirmed" ? (
            <StatusBadge locale={locale} status={item.status} />
          ) : null}
        </div>

        {locale === "en" && item.contentLocale === "bg" ? (
          <p className="mt-1 text-xs font-semibold text-amber-900">
            {getDictionary(locale).program.translationPending}
          </p>
        ) : null}

        {item.description ? (
          <p
            className="mt-2 leading-relaxed text-neutral-700"
            lang={item.contentLocale}
          >
            {item.description}
          </p>
        ) : null}

        {item.speakers.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {item.speakers.map((speaker) => (
              <li
                className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-snug"
                key={speaker.id}
              >
                <span>
                  <span className="font-semibold" lang={speaker.contentLocale}>
                    {speaker.name}
                  </span>
                  {speaker.affiliation ? (
                    <span className="text-neutral-600">
                      {" "}
                      — {speaker.affiliation}
                    </span>
                  ) : null}
                </span>
                {speaker.status !== "confirmed" && speaker.status ? (
                  <StatusBadge locale={locale} status={speaker.status} />
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function SchedulePanel({
  locale,
  panel,
}: {
  locale: Locale;
  panel: PublicSchedulePanel;
}) {
  return (
    <section
      aria-labelledby={`heading-${panel.id}`}
      className="overflow-hidden rounded-2xl border border-conference-green/15 bg-white shadow-lg shadow-conference-green/5"
    >
      <header className="bg-conference-green px-5 py-5 text-white sm:px-7">
        <p className="text-sm font-bold tracking-wide text-white tabular-nums">
          {panel.startTime.slice(0, 5)}–{panel.endTime.slice(0, 5)}
        </p>
        <h4
          className="font-display mt-1 text-xl leading-snug font-semibold sm:text-2xl"
          id={`heading-${panel.id}`}
          lang={panel.contentLocale}
        >
          {panel.title}
        </h4>
        {locale === "en" && panel.contentLocale === "bg" ? (
          <p className="mt-2 text-xs font-semibold text-white">
            {getDictionary(locale).program.translationPending}
          </p>
        ) : null}
      </header>
      <ol className="divide-y divide-neutral-200">
        {panel.items.map((item) => (
          <ScheduleItem
            headingLevel={5}
            item={item}
            key={item.id}
            locale={locale}
          />
        ))}
      </ol>
    </section>
  );
}

export function ProgramSchedule({
  days,
  locale,
  timezone,
}: {
  days: PublicScheduleDay[];
  locale: Locale;
  timezone: string;
}) {
  const text = getDictionary(locale).program;

  return (
    <div className="mt-10">
      <nav aria-label={text.chooseDay} className="flex flex-wrap gap-3">
        {days.map((day, index) => (
          <a
            className="rounded-full border border-conference-green px-5 py-2 text-sm font-bold text-conference-green transition-colors hover:bg-conference-green hover:text-white"
            href={`#program-day-${day.id}`}
            key={day.id}
          >
            {day.title || `${text.dayPrefix} ${index + 1}`}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-16">
        {days.map((day, dayIndex) => {
          const entries: Array<
            | { kind: "item"; value: PublicScheduleItem }
            | { kind: "panel"; value: PublicSchedulePanel }
          > = [
            ...day.ungroupedItems.map((item) => ({
              kind: "item" as const,
              value: item,
            })),
            ...day.panels.map((panel) => ({
              kind: "panel" as const,
              value: panel,
            })),
          ].sort(
            (left, right) =>
              timeToMinutes(left.value.startTime) -
                timeToMinutes(right.value.startTime) ||
              left.value.sortOrder - right.value.sortOrder,
          );

          return (
            <section
              aria-labelledby={`program-day-heading-${day.id}`}
              className="scroll-mt-28"
              id={`program-day-${day.id}`}
              key={day.id}
            >
              <div className="border-b-2 border-conference-green pb-5">
                <p className="text-sm font-bold tracking-[0.14em] text-conference-green uppercase">
                  {day.title || `${text.dayPrefix} ${dayIndex + 1}`}
                </p>
                <h3
                  className="font-display mt-2 text-2xl font-semibold sm:text-3xl"
                  id={`program-day-heading-${day.id}`}
                >
                  {formatConferenceDate(day.date, locale)}
                </h3>
                {day.subtitle ? (
                  <p
                    className="mt-2 text-base font-semibold text-neutral-800"
                    lang={day.contentLocale}
                  >
                    {day.subtitle}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-neutral-600">
                  {text.timezone}: {timezone}
                </p>
              </div>

              <div className="mt-6 space-y-6">
                {entries.map((entry) =>
                  entry.kind === "panel" ? (
                    <SchedulePanel
                      key={entry.value.id}
                      locale={locale}
                      panel={entry.value}
                    />
                  ) : (
                    <ol key={entry.value.id}>
                      <ScheduleItem item={entry.value} locale={locale} />
                    </ol>
                  ),
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
