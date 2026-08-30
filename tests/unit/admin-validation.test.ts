import { describe, expect, it } from "vitest";
import {
  findScheduleOverlaps,
  normalizeExternalUrl,
  normalizeTime,
  translationWarnings,
  validateTimeRange,
} from "@/lib/admin-validation";

describe("admin URL validation", () => {
  it("normalizes safe URLs and empty values", () => {
    expect(normalizeExternalUrl(" https://example.com/path ")).toBe(
      "https://example.com/path",
    );
    expect(normalizeExternalUrl("")).toBeNull();
  });

  it("rejects unsafe schemes and malformed values", () => {
    expect(() => normalizeExternalUrl("javascript:alert(1)")).toThrow(/http/);
    expect(() => normalizeExternalUrl("example.com")).toThrow(/валиден/);
  });
});

describe("schedule validation", () => {
  it("accepts optional item times and rejects reversed ranges", () => {
    expect(normalizeTime("09:30")).toBe("09:30");
    expect(() => validateTimeRange(null, null)).not.toThrow();
    expect(() => validateTimeRange("11:00", "10:00")).toThrow(/преди/);
    expect(() => validateTimeRange(null, "10:00")).toThrow(/начален/);
  });

  it("detects overlaps only in the same day and panel", () => {
    const base = {
      dayId: "day-1",
      panelId: "panel-1",
      startTime: "09:00",
      endTime: "10:00",
    };
    expect(
      findScheduleOverlaps([
        { ...base, id: "a", title: "A" },
        {
          ...base,
          id: "b",
          title: "B",
          startTime: "09:30",
          endTime: "10:30",
        },
        {
          ...base,
          id: "c",
          title: "C",
          panelId: "panel-2",
          startTime: "09:30",
          endTime: "10:30",
        },
      ]),
    ).toEqual(["„B“ се застъпва с „A“."]);
  });

  it("reports missing translations without blocking saves", () => {
    expect(translationWarnings({ label: "сесия", bg: "Тема", en: "" })).toEqual(
      ["Липсва английски текст: сесия."],
    );
  });
});
