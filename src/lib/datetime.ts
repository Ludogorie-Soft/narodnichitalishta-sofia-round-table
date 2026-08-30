export const CONFERENCE_TIMEZONE = "Europe/Sofia";

export const CONFERENCE_START_DATE = "2026-09-18";
export const CONFERENCE_END_DATE = "2026-09-19";

export const scheduleItemTypes = [
  "registration",
  "opening",
  "talk",
  "roundtable",
  "panel",
  "discussion",
  "break",
  "lunch",
  "visit",
  "closing",
] as const;

export type ScheduleItemType = (typeof scheduleItemTypes)[number];

export const scheduleItemStatuses = [
  "confirmed",
  "to_be_confirmed",
  "cancelled",
] as const;

export type ScheduleItemStatus = (typeof scheduleItemStatuses)[number];

/** Noon UTC on the calendar date, so Europe/Sofia stays on the same civil day. */
export function conferenceUtcNoon(isoDate: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    throw new Error(`Invalid ISO date: ${isoDate}`);
  }
  return new Date(`${isoDate}T12:00:00.000Z`);
}

export function formatConferenceDate(
  isoDate: string,
  locale: "bg" | "en",
): string {
  return new Intl.DateTimeFormat(locale === "bg" ? "bg-BG" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: CONFERENCE_TIMEZONE,
  }).format(conferenceUtcNoon(isoDate));
}

export function calendarDateInSofia(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFERENCE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
