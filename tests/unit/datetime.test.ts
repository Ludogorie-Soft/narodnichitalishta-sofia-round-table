import { describe, expect, it } from "vitest";
import {
  calendarDateInSofia,
  CONFERENCE_END_DATE,
  CONFERENCE_START_DATE,
  CONFERENCE_TIMEZONE,
  conferenceUtcNoon,
  formatConferenceDate,
  scheduleItemStatuses,
  scheduleItemTypes,
} from "@/lib/datetime";

describe("conference dates in Europe/Sofia", () => {
  it("keeps 18–19 September 2026 on the same civil date", () => {
    expect(calendarDateInSofia(conferenceUtcNoon(CONFERENCE_START_DATE))).toBe(
      "2026-09-18",
    );
    expect(calendarDateInSofia(conferenceUtcNoon(CONFERENCE_END_DATE))).toBe(
      "2026-09-19",
    );
  });

  it("formats weekday and date for both locales", () => {
    const bg = formatConferenceDate(CONFERENCE_START_DATE, "bg");
    const en = formatConferenceDate(CONFERENCE_START_DATE, "en");

    expect(bg).toMatch(/18/);
    expect(bg).toMatch(/2026/);
    expect(en.toLowerCase()).toContain("friday");
    expect(en).toMatch(/18/);
    expect(en).toMatch(/September/i);
  });

  it("uses the conference timezone name", () => {
    expect(CONFERENCE_TIMEZONE).toBe("Europe/Sofia");
  });
});

describe("schedule enums", () => {
  it("includes the planned item types and statuses", () => {
    expect(scheduleItemTypes).toEqual([
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
    ]);
    expect(scheduleItemStatuses).toEqual([
      "confirmed",
      "to_be_confirmed",
      "cancelled",
    ]);
  });
});
