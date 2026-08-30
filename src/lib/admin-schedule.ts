import "server-only";

import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import {
  scheduleDays,
  scheduleItems,
  scheduleItemSpeakers,
  schedulePanels,
  speakers,
} from "@/db/schema";
import { findScheduleOverlaps } from "@/lib/admin-validation";

export async function getAdminScheduleData() {
  const db = getDb();
  const [days, panels, items, people] = await Promise.all([
    db.query.scheduleDays.findMany({
      orderBy: [asc(scheduleDays.sortOrder)],
    }),
    db.query.schedulePanels.findMany({
      orderBy: [asc(schedulePanels.sortOrder)],
    }),
    db.query.scheduleItems.findMany({
      orderBy: [asc(scheduleItems.sortOrder)],
      with: {
        speakers: {
          orderBy: [asc(scheduleItemSpeakers.sortOrder)],
          with: { speaker: true },
        },
      },
    }),
    db.query.speakers.findMany({
      orderBy: [asc(speakers.nameBg)],
    }),
  ]);

  return {
    days,
    panels,
    items,
    speakers: people,
    warnings: findScheduleOverlaps(
      items.map((item) => ({ ...item, title: item.titleBg })),
    ),
  };
}
