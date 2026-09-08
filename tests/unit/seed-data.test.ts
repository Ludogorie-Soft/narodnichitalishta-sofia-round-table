import { describe, expect, it } from "vitest";
import {
  scheduleDaySeeds,
  scheduleItemSeeds,
  schedulePanelSeeds,
  speakerSeeds,
} from "../../scripts/seed-data";
import { analyzeSeedData } from "../../scripts/seed-report";

describe("conference seed data", () => {
  it("contains both days, all panels, and the full Bulgarian schedule", () => {
    expect(scheduleDaySeeds).toHaveLength(2);
    expect(schedulePanelSeeds).toHaveLength(3);
    expect(scheduleItemSeeds).toHaveLength(20);
    expect(scheduleItemSeeds.some((item) => item.itemType === "visit")).toBe(
      true,
    );
    expect(scheduleItemSeeds.some((item) => item.itemType === "closing")).toBe(
      true,
    );
    expect(
      scheduleItemSeeds.some((item) => item.id === "item-heart-of-chitalishte"),
    ).toBe(true);
    expect(
      scheduleItemSeeds.some((item) => item.id === "item-day-2-lunch"),
    ).toBe(false);
    expect(
      speakerSeeds.some((speaker) => speaker.id === "speaker-evtim-miloshev"),
    ).toBe(true);
    expect(
      speakerSeeds.some((speaker) => speaker.id === "speaker-ivo-hristov"),
    ).toBe(false);
    expect(scheduleDaySeeds[1]?.subtitleBg).toContain("международните");
    expect(
      scheduleItemSeeds.filter((item) => item.status === "to_be_confirmed"),
    ).toEqual([]);
    expect(
      speakerSeeds
        .filter((speaker) => speaker.status === "to_be_confirmed")
        .map((speaker) => speaker.id),
    ).toEqual([
      "speaker-evtim-miloshev",
      "speaker-vasil-terziev",
      "speaker-mep-tbc",
    ]);
  });

  it("has no invalid times, overlaps, duplicate IDs, or orphan references", () => {
    const errors = analyzeSeedData().filter(
      (issue) => issue.severity === "error",
    );

    expect(errors).toEqual([]);
  });

  it("has a complete English translation with no missing_translation warnings", () => {
    const translationWarnings = analyzeSeedData().filter(
      (issue) => issue.code === "missing_translation",
    );

    expect(translationWarnings).toEqual([]);
  });
});
