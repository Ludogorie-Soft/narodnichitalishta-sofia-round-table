import {
  contentSectionSeeds,
  scheduleDaySeeds,
  scheduleItemSeeds,
  schedulePanelSeeds,
  speakerSeeds,
} from "./seed-data";

export type SeedIssue = {
  severity: "error" | "warning";
  code:
    | "duplicate_id"
    | "invalid_time"
    | "missing_translation"
    | "orphan_reference"
    | "overlap";
  entity: string;
  message: string;
};

function duplicateIdIssues(
  entity: string,
  values: ReadonlyArray<{ id: string }>,
): SeedIssue[] {
  const seen = new Set<string>();
  const issues: SeedIssue[] = [];

  for (const value of values) {
    if (seen.has(value.id)) {
      issues.push({
        severity: "error",
        code: "duplicate_id",
        entity: `${entity}:${value.id}`,
        message: `Duplicate ${entity} ID.`,
      });
    }
    seen.add(value.id);
  }

  return issues;
}

function minutes(time: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    return Number.NaN;
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export function analyzeSeedData(): SeedIssue[] {
  const issues: SeedIssue[] = [
    ...duplicateIdIssues("content", contentSectionSeeds),
    ...duplicateIdIssues("day", scheduleDaySeeds),
    ...duplicateIdIssues("panel", schedulePanelSeeds),
    ...duplicateIdIssues("item", scheduleItemSeeds),
    ...duplicateIdIssues("speaker", speakerSeeds),
  ];
  const dayIds = new Set<string>(scheduleDaySeeds.map((day) => day.id));
  const panelIds = new Set<string>(schedulePanelSeeds.map((panel) => panel.id));
  const speakerIds = new Set<string>(speakerSeeds.map((speaker) => speaker.id));

  for (const day of scheduleDaySeeds) {
    if (!day.titleEn || !day.subtitleEn) {
      issues.push({
        severity: "warning",
        code: "missing_translation",
        entity: `day:${day.id}`,
        message: "One or more English fields are missing.",
      });
    }
  }

  for (const panel of schedulePanelSeeds) {
    if (!dayIds.has(panel.dayId)) {
      issues.push({
        severity: "error",
        code: "orphan_reference",
        entity: `panel:${panel.id}`,
        message: `Unknown day ${panel.dayId}.`,
      });
    }
    if (!panel.titleEn) {
      issues.push({
        severity: "warning",
        code: "missing_translation",
        entity: `panel:${panel.id}`,
        message: "English title is missing.",
      });
    }
    if (minutes(panel.endTime) < minutes(panel.startTime)) {
      issues.push({
        severity: "error",
        code: "invalid_time",
        entity: `panel:${panel.id}`,
        message: "Panel end time is earlier than its start time.",
      });
    }
  }

  for (const item of scheduleItemSeeds) {
    if (!dayIds.has(item.dayId)) {
      issues.push({
        severity: "error",
        code: "orphan_reference",
        entity: `item:${item.id}`,
        message: `Unknown day ${item.dayId}.`,
      });
    }
    if (item.panelId && !panelIds.has(item.panelId)) {
      issues.push({
        severity: "error",
        code: "orphan_reference",
        entity: `item:${item.id}`,
        message: `Unknown panel ${item.panelId}.`,
      });
    }
    for (const speakerId of item.speakerIds) {
      if (!speakerIds.has(speakerId)) {
        issues.push({
          severity: "error",
          code: "orphan_reference",
          entity: `item:${item.id}`,
          message: `Unknown speaker ${speakerId}.`,
        });
      }
    }
    if (!item.titleEn) {
      issues.push({
        severity: "warning",
        code: "missing_translation",
        entity: `item:${item.id}`,
        message: "English title is missing.",
      });
    }
    if (
      item.startTime &&
      item.endTime &&
      minutes(item.endTime) < minutes(item.startTime)
    ) {
      issues.push({
        severity: "error",
        code: "invalid_time",
        entity: `item:${item.id}`,
        message: "Item end time is earlier than its start time.",
      });
    }
  }

  for (const speaker of speakerSeeds) {
    if (!speaker.nameEn) {
      issues.push({
        severity: "warning",
        code: "missing_translation",
        entity: `speaker:${speaker.id}`,
        message: "English name is missing.",
      });
    }
  }

  for (const day of scheduleDaySeeds) {
    const timedItems = scheduleItemSeeds
      .filter((item) => item.dayId === day.id && item.startTime && item.endTime)
      .sort(
        (left, right) => minutes(left.startTime!) - minutes(right.startTime!),
      );

    for (let index = 1; index < timedItems.length; index += 1) {
      const previous = timedItems[index - 1]!;
      const current = timedItems[index]!;
      if (minutes(current.startTime!) < minutes(previous.endTime!)) {
        issues.push({
          severity: "error",
          code: "overlap",
          entity: `item:${current.id}`,
          message: `Overlaps ${previous.id}.`,
        });
      }
    }
  }

  return issues;
}
