import { describe, expect, it } from "vitest";
import {
  scheduleDaySeeds,
  scheduleItemSeeds,
  schedulePanelSeeds,
} from "../../scripts/seed-data";
import { analyzeSeedData } from "../../scripts/seed-report";

describe("conference seed data", () => {
  it("contains both days, all panels, and the full Bulgarian schedule", () => {
    expect(scheduleDaySeeds).toHaveLength(2);
    expect(schedulePanelSeeds).toHaveLength(3);
    expect(scheduleItemSeeds).toHaveLength(21);
    expect(scheduleItemSeeds.some((item) => item.itemType === "visit")).toBe(
      true,
    );
    expect(scheduleItemSeeds.some((item) => item.itemType === "closing")).toBe(
      true,
    );
  });

  it("has no invalid times, overlaps, duplicate IDs, or orphan references", () => {
    const errors = analyzeSeedData().filter(
      (issue) => issue.severity === "error",
    );

    expect(errors).toEqual([]);
  });

  it("reports the intentionally incomplete English translation", () => {
    const translationWarnings = analyzeSeedData().filter(
      (issue) => issue.code === "missing_translation",
    );

    expect(translationWarnings.length).toBeGreaterThan(0);
    expect(
      translationWarnings.some(
        (issue) => issue.entity === "panel:panel-2-european-capital",
      ),
    ).toBe(true);
  });
});
