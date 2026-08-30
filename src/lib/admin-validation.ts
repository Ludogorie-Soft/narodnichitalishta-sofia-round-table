export type ScheduleTimeRecord = {
  id: string;
  title: string;
  dayId: string;
  panelId: string | null;
  startTime: string | null;
  endTime: string | null;
};

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function normalizeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("Въведете пълен и валиден интернет адрес.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Разрешени са само http и https адреси.");
  }

  return url.toString();
}

export function normalizeTime(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!timePattern.test(trimmed)) {
    throw new Error("Часът трябва да бъде във формат HH:MM.");
  }
  return trimmed;
}

export function timeToMinutes(value: string): number {
  const match = timePattern.exec(value.slice(0, 5));
  if (!match) throw new Error(`Invalid time: ${value}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

export function validateTimeRange(
  startTime: string | null,
  endTime: string | null,
  options: { required?: boolean } = {},
) {
  if (options.required && (!startTime || !endTime)) {
    throw new Error("Началният и крайният час са задължителни.");
  }
  if (endTime && !startTime) {
    throw new Error("Крайният час изисква начален час.");
  }
  if (
    startTime &&
    endTime &&
    timeToMinutes(endTime) < timeToMinutes(startTime)
  ) {
    throw new Error("Крайният час не може да бъде преди началния.");
  }
}

export function findScheduleOverlaps(records: ScheduleTimeRecord[]): string[] {
  const groups = new Map<string, ScheduleTimeRecord[]>();

  for (const record of records) {
    if (!record.startTime || !record.endTime) continue;
    const key = `${record.dayId}:${record.panelId ?? "ungrouped"}`;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  const warnings: string[] = [];
  for (const group of groups.values()) {
    group.sort(
      (left, right) =>
        timeToMinutes(left.startTime!) - timeToMinutes(right.startTime!),
    );
    for (let index = 1; index < group.length; index += 1) {
      const previous = group[index - 1]!;
      const current = group[index]!;
      if (
        timeToMinutes(current.startTime!) < timeToMinutes(previous.endTime!)
      ) {
        warnings.push(`„${current.title}“ се застъпва с „${previous.title}“.`);
      }
    }
  }
  return warnings;
}

export function translationWarnings(input: {
  label: string;
  bg: string;
  en: string;
}): string[] {
  const warnings: string[] = [];
  if (!input.bg.trim())
    warnings.push(`Липсва български текст: ${input.label}.`);
  if (!input.en.trim())
    warnings.push(`Липсва английски текст: ${input.label}.`);
  return warnings;
}
