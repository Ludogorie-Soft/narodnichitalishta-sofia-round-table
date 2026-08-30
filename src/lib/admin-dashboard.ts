import "server-only";

import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  auditLog,
  scheduleDays,
  scheduleItems,
  schedulePanels,
  siteSettings,
} from "@/db/schema";
import { findScheduleOverlaps, timeToMinutes } from "@/lib/admin-validation";

export type AdminDashboardData = {
  venue: {
    published: boolean;
    complete: boolean;
  };
  translationWarnings: string[];
  scheduleWarnings: string[];
  recentActivity: Array<{
    id: string;
    action: string;
    entityType: string;
    summary: string;
    createdAt: Date;
    actorName: string | null;
  }>;
};

function hasContent(value: unknown): boolean {
  if (!value) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.some(hasContent);
  }
  if (typeof value === "object") {
    return Object.values(value).some(hasContent);
  }
  return false;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const db = getDb();
  const [settings, sections, days, panels, items, people, activity] =
    await Promise.all([
      db.query.siteSettings.findFirst({
        where: eq(siteSettings.id, 1),
      }),
      db.query.contentSections.findMany(),
      db.query.scheduleDays.findMany({
        orderBy: [asc(scheduleDays.sortOrder)],
      }),
      db.query.schedulePanels.findMany({
        orderBy: [asc(schedulePanels.sortOrder)],
      }),
      db.query.scheduleItems.findMany({
        orderBy: [asc(scheduleItems.sortOrder)],
      }),
      db.query.speakers.findMany(),
      db.query.auditLog.findMany({
        orderBy: [desc(auditLog.createdAt)],
        limit: 8,
        with: { actor: true },
      }),
    ]);

  const translationWarnings: string[] = [];

  for (const section of sections) {
    if (!section.headingBg?.trim() || !hasContent(section.contentBg)) {
      translationWarnings.push(`Липсва българско съдържание: ${section.slug}`);
    }
    if (!section.headingEn?.trim() || !hasContent(section.contentEn)) {
      translationWarnings.push(`Липсва английско съдържание: ${section.slug}`);
    }
  }

  for (const day of days) {
    if (!day.titleBg.trim()) {
      translationWarnings.push(`Липсва българско заглавие за ${day.date}`);
    }
    if (!day.titleEn.trim()) {
      translationWarnings.push(`Липсва английско заглавие за ${day.date}`);
    }
  }

  for (const panel of panels) {
    if (!panel.titleBg.trim()) {
      translationWarnings.push(
        `Липсва българско заглавие за панел ${panel.id}`,
      );
    }
    if (!panel.titleEn.trim()) {
      translationWarnings.push(
        `Липсва английско заглавие за панел ${panel.id}`,
      );
    }
  }

  for (const item of items) {
    if (!item.titleBg.trim()) {
      translationWarnings.push(`Липсва българско заглавие за сесия ${item.id}`);
    }
    if (!item.titleEn.trim()) {
      translationWarnings.push(`Липсва английско заглавие за сесия ${item.id}`);
    }
  }

  for (const person of people) {
    if (!person.nameBg.trim()) {
      translationWarnings.push(`Липсва българско име за ${person.id}`);
    }
    if (!person.nameEn.trim()) {
      translationWarnings.push(`Липсва английско име за ${person.nameBg}`);
    }
  }

  const scheduleWarnings: string[] = [];
  for (const item of items) {
    if (
      item.startTime &&
      item.endTime &&
      timeToMinutes(item.endTime) < timeToMinutes(item.startTime)
    ) {
      scheduleWarnings.push(
        `Крайният час е преди началния за „${item.titleBg}“.`,
      );
    }
  }

  scheduleWarnings.push(
    ...findScheduleOverlaps(
      items.map((item) => ({ ...item, title: item.titleBg })),
    ),
  );

  const venueComplete = Boolean(
    settings?.venueNameBg?.trim() &&
    settings.venueNameEn?.trim() &&
    settings.venueAddressBg?.trim() &&
    settings.venueAddressEn?.trim(),
  );

  return {
    venue: {
      published: settings?.venuePublished ?? false,
      complete: venueComplete,
    },
    translationWarnings,
    scheduleWarnings,
    recentActivity: activity.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      summary: entry.summary,
      createdAt: entry.createdAt,
      actorName: entry.actor?.name ?? null,
    })),
  };
}
