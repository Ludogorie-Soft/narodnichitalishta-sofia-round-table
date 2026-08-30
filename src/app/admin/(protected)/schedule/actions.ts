"use server";

import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import {
  scheduleDays,
  scheduleItems,
  scheduleItemSpeakers,
  schedulePanels,
  speakers,
} from "@/db/schema";
import { normalizeTime, validateTimeRange } from "@/lib/admin-validation";
import { recordAudit } from "@/lib/audit";
import { revalidatePublicSite } from "@/lib/cache";
import { scheduleItemStatuses, scheduleItemTypes } from "@/lib/datetime";
import { requireAdminSession } from "@/lib/session";

export type ScheduleFormState = {
  error?: string;
  success?: string;
  warnings?: string[];
};

const idSchema = z.string().max(100);
const title = z.string().trim().max(500);
const description = z.string().trim().max(10_000);
const text = (data: FormData, key: string) => String(data.get(key) ?? "");
const optional = (value: string) => value || null;

function refreshSchedule() {
  revalidatePublicSite();
  revalidatePath("/admin");
  revalidatePath("/admin/schedule");
}

async function nextSortOrder(
  values: Array<{ sortOrder: number }>,
): Promise<number> {
  return Math.max(-10, ...values.map((value) => value.sortOrder)) + 10;
}

export async function saveDayAction(
  _previous: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const session = await requireAdminSession();
  const parsed = z
    .object({
      id: idSchema,
      date: z.string().date(),
      titleBg: title,
      titleEn: title,
      subtitleBg: description,
      subtitleEn: description,
      visible: z.boolean(),
    })
    .safeParse({
      id: text(formData, "id"),
      date: text(formData, "date"),
      titleBg: text(formData, "titleBg"),
      titleEn: text(formData, "titleEn"),
      subtitleBg: text(formData, "subtitleBg"),
      subtitleEn: text(formData, "subtitleEn"),
      visible: formData.get("visible") === "on",
    });
  if (!parsed.success) return { error: "Проверете датата и текстовете." };

  const db = getDb();
  const warnings = [];
  if (!parsed.data.titleBg) warnings.push("Липсва българско заглавие.");
  if (!parsed.data.titleEn) warnings.push("Липсва английско заглавие.");
  const id = parsed.data.id || crypto.randomUUID();
  const existing = parsed.data.id
    ? await db.query.scheduleDays.findFirst({
        where: eq(scheduleDays.id, parsed.data.id),
      })
    : null;

  if (existing) {
    await db
      .update(scheduleDays)
      .set({
        ...parsed.data,
        subtitleBg: optional(parsed.data.subtitleBg),
        subtitleEn: optional(parsed.data.subtitleEn),
        updatedAt: new Date(),
      })
      .where(eq(scheduleDays.id, id));
  } else {
    const rows = await db.query.scheduleDays.findMany();
    await db.insert(scheduleDays).values({
      ...parsed.data,
      id,
      titleBg: parsed.data.titleBg,
      titleEn: parsed.data.titleEn,
      subtitleBg: optional(parsed.data.subtitleBg),
      subtitleEn: optional(parsed.data.subtitleEn),
      sortOrder: await nextSortOrder(rows),
    });
  }
  await recordAudit({
    actorUserId: session.user.id,
    action: existing
      ? existing.visible !== parsed.data.visible
        ? "visibility"
        : "update"
      : "create",
    entityType: "schedule_day",
    entityId: id,
    summary: `${existing ? "Редактиран" : "Създаден"} ден ${parsed.data.date}.`,
  });
  refreshSchedule();
  return { success: "Денят е публикуван.", warnings };
}

export async function savePanelAction(
  _previous: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const session = await requireAdminSession();
  const parsed = z
    .object({
      id: idSchema,
      dayId: z.string().min(1),
      startTime: z.string(),
      endTime: z.string(),
      titleBg: title,
      titleEn: title,
      descriptionBg: description,
      descriptionEn: description,
      visible: z.boolean(),
    })
    .safeParse({
      id: text(formData, "id"),
      dayId: text(formData, "dayId"),
      startTime: text(formData, "startTime"),
      endTime: text(formData, "endTime"),
      titleBg: text(formData, "titleBg"),
      titleEn: text(formData, "titleEn"),
      descriptionBg: text(formData, "descriptionBg"),
      descriptionEn: text(formData, "descriptionEn"),
      visible: formData.get("visible") === "on",
    });
  if (!parsed.success) return { error: "Проверете полетата на панела." };

  try {
    const startTime = normalizeTime(parsed.data.startTime);
    const endTime = normalizeTime(parsed.data.endTime);
    validateTimeRange(startTime, endTime, { required: true });
    const db = getDb();
    const day = await db.query.scheduleDays.findFirst({
      columns: { id: true },
      where: eq(scheduleDays.id, parsed.data.dayId),
    });
    if (!day) return { error: "Избраният ден не съществува." };
    const id = parsed.data.id || crypto.randomUUID();
    const existing = parsed.data.id
      ? await db.query.schedulePanels.findFirst({
          where: eq(schedulePanels.id, parsed.data.id),
        })
      : null;
    const values = {
      dayId: parsed.data.dayId,
      startTime: startTime!,
      endTime: endTime!,
      titleBg: parsed.data.titleBg,
      titleEn: parsed.data.titleEn,
      descriptionBg: optional(parsed.data.descriptionBg),
      descriptionEn: optional(parsed.data.descriptionEn),
      visible: parsed.data.visible,
    };
    if (existing) {
      await db
        .update(schedulePanels)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(schedulePanels.id, id));
    } else {
      const siblings = await db.query.schedulePanels.findMany({
        where: eq(schedulePanels.dayId, parsed.data.dayId),
      });
      await db
        .insert(schedulePanels)
        .values({ ...values, id, sortOrder: await nextSortOrder(siblings) });
    }
    await recordAudit({
      actorUserId: session.user.id,
      action: existing
        ? existing.visible !== parsed.data.visible
          ? "visibility"
          : "update"
        : "create",
      entityType: "schedule_panel",
      entityId: id,
      summary: `${existing ? "Редактиран" : "Създаден"} панел „${parsed.data.titleBg || parsed.data.titleEn}“.`,
    });
    refreshSchedule();
    return {
      success: "Панелът е публикуван.",
      warnings: [
        ...(!parsed.data.titleBg ? ["Липсва българско заглавие."] : []),
        ...(!parsed.data.titleEn ? ["Липсва английско заглавие."] : []),
      ],
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Грешка." };
  }
}

export async function saveItemAction(
  _previous: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const session = await requireAdminSession();
  const parsed = z
    .object({
      id: idSchema,
      dayId: z.string().min(1),
      panelId: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      itemType: z.enum(scheduleItemTypes),
      status: z.enum(scheduleItemStatuses),
      titleBg: title,
      titleEn: title,
      descriptionBg: description,
      descriptionEn: description,
      visible: z.boolean(),
      speakerIds: z.array(z.string().min(1)),
    })
    .safeParse({
      id: text(formData, "id"),
      dayId: text(formData, "dayId"),
      panelId: text(formData, "panelId"),
      startTime: text(formData, "startTime"),
      endTime: text(formData, "endTime"),
      itemType: text(formData, "itemType"),
      status: text(formData, "status"),
      titleBg: text(formData, "titleBg"),
      titleEn: text(formData, "titleEn"),
      descriptionBg: text(formData, "descriptionBg"),
      descriptionEn: text(formData, "descriptionEn"),
      visible: formData.get("visible") === "on",
      speakerIds: formData.getAll("speakerIds").map(String),
    });
  if (!parsed.success) return { error: "Проверете полетата на сесията." };

  try {
    const startTime = normalizeTime(parsed.data.startTime);
    const endTime = normalizeTime(parsed.data.endTime);
    validateTimeRange(startTime, endTime);
    const db = getDb();
    const day = await db.query.scheduleDays.findFirst({
      columns: { id: true },
      where: eq(scheduleDays.id, parsed.data.dayId),
    });
    if (!day) return { error: "Избраният ден не съществува." };
    const panelId = optional(parsed.data.panelId);
    if (panelId) {
      const panel = await db.query.schedulePanels.findFirst({
        columns: { dayId: true },
        where: eq(schedulePanels.id, panelId),
      });
      if (!panel || panel.dayId !== parsed.data.dayId) {
        return { error: "Панелът трябва да принадлежи на избрания ден." };
      }
    }
    const uniqueSpeakerIds = [...new Set(parsed.data.speakerIds)];
    if (uniqueSpeakerIds.length) {
      const validPeople = await db
        .select({ id: speakers.id })
        .from(speakers)
        .where(inArray(speakers.id, uniqueSpeakerIds));
      if (validPeople.length !== uniqueSpeakerIds.length) {
        return { error: "Един от избраните говорители не съществува." };
      }
    }
    const id = parsed.data.id || crypto.randomUUID();
    const existing = parsed.data.id
      ? await db.query.scheduleItems.findFirst({
          where: eq(scheduleItems.id, parsed.data.id),
        })
      : null;
    const values = {
      dayId: parsed.data.dayId,
      panelId,
      startTime,
      endTime,
      itemType: parsed.data.itemType,
      status: parsed.data.status,
      titleBg: parsed.data.titleBg,
      titleEn: parsed.data.titleEn,
      descriptionBg: optional(parsed.data.descriptionBg),
      descriptionEn: optional(parsed.data.descriptionEn),
      visible: parsed.data.visible,
    };
    if (existing) {
      await db
        .update(scheduleItems)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(scheduleItems.id, id));
    } else {
      const siblings = await db.query.scheduleItems.findMany({
        where: panelId
          ? and(
              eq(scheduleItems.dayId, parsed.data.dayId),
              eq(scheduleItems.panelId, panelId),
            )
          : and(
              eq(scheduleItems.dayId, parsed.data.dayId),
              isNull(scheduleItems.panelId),
            ),
      });
      await db
        .insert(scheduleItems)
        .values({ ...values, id, sortOrder: await nextSortOrder(siblings) });
    }
    await db
      .delete(scheduleItemSpeakers)
      .where(eq(scheduleItemSpeakers.itemId, id));
    if (uniqueSpeakerIds.length) {
      await db.insert(scheduleItemSpeakers).values(
        uniqueSpeakerIds.map((speakerId, sortOrder) => ({
          itemId: id,
          speakerId,
          sortOrder,
        })),
      );
    }
    await recordAudit({
      actorUserId: session.user.id,
      action: existing
        ? existing.visible !== parsed.data.visible
          ? "visibility"
          : "update"
        : "create",
      entityType: "schedule_item",
      entityId: id,
      summary: `${existing ? "Редактирана" : "Създадена"} сесия „${parsed.data.titleBg || parsed.data.titleEn}“.`,
    });
    refreshSchedule();
    return {
      success: "Сесията е публикувана.",
      warnings: [
        ...(!parsed.data.titleBg ? ["Липсва българско заглавие."] : []),
        ...(!parsed.data.titleEn ? ["Липсва английско заглавие."] : []),
      ],
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Грешка." };
  }
}

export async function saveSpeakerAction(
  _previous: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const session = await requireAdminSession();
  const parsed = z
    .object({
      id: idSchema,
      nameBg: title,
      nameEn: title,
      affiliationBg: description,
      affiliationEn: description,
    })
    .safeParse({
      id: text(formData, "id"),
      nameBg: text(formData, "nameBg"),
      nameEn: text(formData, "nameEn"),
      affiliationBg: text(formData, "affiliationBg"),
      affiliationEn: text(formData, "affiliationEn"),
    });
  if (!parsed.success || (!parsed.data?.nameBg && !parsed.data?.nameEn)) {
    return { error: "Въведете име на поне един език." };
  }
  const db = getDb();
  const id = parsed.data.id || crypto.randomUUID();
  const existing = parsed.data.id
    ? await db.query.speakers.findFirst({ where: eq(speakers.id, id) })
    : null;
  const values = {
    nameBg: parsed.data.nameBg,
    nameEn: parsed.data.nameEn,
    affiliationBg: optional(parsed.data.affiliationBg),
    affiliationEn: optional(parsed.data.affiliationEn),
  };
  if (existing) {
    await db
      .update(speakers)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(speakers.id, id));
  } else {
    await db.insert(speakers).values({ ...values, id });
  }
  await recordAudit({
    actorUserId: session.user.id,
    action: existing ? "update" : "create",
    entityType: "speaker",
    entityId: id,
    summary: `${existing ? "Редактиран" : "Създаден"} говорител „${parsed.data.nameBg || parsed.data.nameEn}“.`,
  });
  refreshSchedule();
  return { success: "Говорителят е запазен." };
}

export async function moveScheduleEntityAction(formData: FormData) {
  const session = await requireAdminSession();
  const entity = text(formData, "entity");
  const id = text(formData, "id");
  const direction = text(formData, "direction");
  if (!["day", "panel", "item"].includes(entity)) return;
  if (!["up", "down"].includes(direction)) return;
  const db = getDb();

  let rows: Array<{ id: string; sortOrder: number }> = [];
  if (entity === "day") {
    rows = await db.query.scheduleDays.findMany({
      columns: { id: true, sortOrder: true },
      orderBy: [asc(scheduleDays.sortOrder)],
    });
  } else if (entity === "panel") {
    const current = await db.query.schedulePanels.findFirst({
      where: eq(schedulePanels.id, id),
    });
    if (!current) return;
    rows = await db.query.schedulePanels.findMany({
      columns: { id: true, sortOrder: true },
      where: eq(schedulePanels.dayId, current.dayId),
      orderBy: [asc(schedulePanels.sortOrder)],
    });
  } else {
    const current = await db.query.scheduleItems.findFirst({
      where: eq(scheduleItems.id, id),
    });
    if (!current) return;
    rows = await db.query.scheduleItems.findMany({
      columns: { id: true, sortOrder: true },
      where: current.panelId
        ? and(
            eq(scheduleItems.dayId, current.dayId),
            eq(scheduleItems.panelId, current.panelId),
          )
        : and(
            eq(scheduleItems.dayId, current.dayId),
            isNull(scheduleItems.panelId),
          ),
      orderBy: [asc(scheduleItems.sortOrder)],
    });
  }
  const index = rows.findIndex((row) => row.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
  const current = rows[index]!;
  const target = rows[targetIndex]!;
  const table =
    entity === "day"
      ? scheduleDays
      : entity === "panel"
        ? schedulePanels
        : scheduleItems;
  await Promise.all([
    db
      .update(table)
      .set({ sortOrder: target.sortOrder, updatedAt: new Date() })
      .where(eq(table.id, current.id)),
    db
      .update(table)
      .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
      .where(eq(table.id, target.id)),
  ]);
  await recordAudit({
    actorUserId: session.user.id,
    action: "reorder",
    entityType: `schedule_${entity}`,
    entityId: id,
    summary: `Променен ред на ${entity}.`,
  });
  refreshSchedule();
}

export async function moveItemSpeakerAction(formData: FormData) {
  const session = await requireAdminSession();
  const itemId = text(formData, "id");
  const [speakerId, direction] = text(formData, "speakerCommand").split(":");
  if (!speakerId || (direction !== "up" && direction !== "down")) return;
  const db = getDb();
  const rows = await db.query.scheduleItemSpeakers.findMany({
    where: eq(scheduleItemSpeakers.itemId, itemId),
    orderBy: [asc(scheduleItemSpeakers.sortOrder)],
  });
  const index = rows.findIndex((row) => row.speakerId === speakerId);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
  const current = rows[index]!;
  const target = rows[targetIndex]!;
  await Promise.all([
    db
      .update(scheduleItemSpeakers)
      .set({ sortOrder: target.sortOrder })
      .where(
        and(
          eq(scheduleItemSpeakers.itemId, itemId),
          eq(scheduleItemSpeakers.speakerId, current.speakerId),
        ),
      ),
    db
      .update(scheduleItemSpeakers)
      .set({ sortOrder: current.sortOrder })
      .where(
        and(
          eq(scheduleItemSpeakers.itemId, itemId),
          eq(scheduleItemSpeakers.speakerId, target.speakerId),
        ),
      ),
  ]);
  await recordAudit({
    actorUserId: session.user.id,
    action: "reorder",
    entityType: "schedule_item_speaker",
    entityId: itemId,
    summary: "Променен ред на говорителите в сесия.",
  });
  refreshSchedule();
}

export async function deleteScheduleEntityAction(
  _previous: ScheduleFormState,
  formData: FormData,
): Promise<ScheduleFormState> {
  const session = await requireAdminSession();
  if (formData.get("confirmation") !== "DELETE") {
    return { error: "Въведете DELETE, за да потвърдите." };
  }
  const entity = text(formData, "entity");
  const id = text(formData, "id");
  const db = getDb();
  try {
    if (entity === "day") {
      await db.delete(scheduleDays).where(eq(scheduleDays.id, id));
    } else if (entity === "panel") {
      await db.delete(schedulePanels).where(eq(schedulePanels.id, id));
    } else if (entity === "item") {
      await db.delete(scheduleItems).where(eq(scheduleItems.id, id));
    } else if (entity === "speaker") {
      const link = await db.query.scheduleItemSpeakers.findFirst({
        where: eq(scheduleItemSpeakers.speakerId, id),
      });
      if (link) {
        return {
          error:
            "Говорителят участва в програма. Първо го премахнете от сесиите.",
        };
      }
      await db.delete(speakers).where(eq(speakers.id, id));
    } else {
      return { error: "Непознат тип запис." };
    }
    await recordAudit({
      actorUserId: session.user.id,
      action: "delete",
      entityType: entity,
      entityId: id,
      summary: `Изтрит запис от тип ${entity}.`,
    });
    refreshSchedule();
    return { success: "Записът е изтрит." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Записът не беше изтрит.",
    };
  }
}
