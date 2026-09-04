import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  time,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { timestamps } from "./columns";
import { scheduleItemStatusEnum, scheduleItemTypeEnum } from "./enums";

export const scheduleDays = pgTable(
  "schedule_days",
  {
    id: text("id").primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    titleBg: text("title_bg").notNull(),
    titleEn: text("title_en").notNull(),
    subtitleBg: text("subtitle_bg"),
    subtitleEn: text("subtitle_en"),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("schedule_days_sort_idx").on(table.sortOrder),
    index("schedule_days_visible_sort_idx").on(table.visible, table.sortOrder),
  ],
);

export const schedulePanels = pgTable(
  "schedule_panels",
  {
    id: text("id").primaryKey(),
    dayId: text("day_id")
      .notNull()
      .references(() => scheduleDays.id, { onDelete: "cascade" }),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    titleBg: text("title_bg").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionBg: text("description_bg"),
    descriptionEn: text("description_en"),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("schedule_panels_day_sort_idx").on(table.dayId, table.sortOrder),
  ],
);

export const scheduleItems = pgTable(
  "schedule_items",
  {
    id: text("id").primaryKey(),
    dayId: text("day_id")
      .notNull()
      .references(() => scheduleDays.id, { onDelete: "cascade" }),
    panelId: text("panel_id").references(() => schedulePanels.id, {
      onDelete: "set null",
    }),
    startTime: time("start_time"),
    endTime: time("end_time"),
    itemType: scheduleItemTypeEnum("item_type").notNull(),
    titleBg: text("title_bg").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionBg: text("description_bg"),
    descriptionEn: text("description_en"),
    status: scheduleItemStatusEnum("status").notNull().default("confirmed"),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("schedule_items_day_sort_idx").on(table.dayId, table.sortOrder),
    index("schedule_items_panel_sort_idx").on(table.panelId, table.sortOrder),
    index("schedule_items_visible_day_idx").on(
      table.visible,
      table.dayId,
      table.sortOrder,
    ),
    check(
      "schedule_items_time_order_chk",
      sql`${table.endTime} is null or (${table.startTime} is not null and ${table.endTime} >= ${table.startTime})`,
    ),
  ],
);

export const speakers = pgTable("speakers", {
  id: text("id").primaryKey(),
  nameBg: text("name_bg").notNull(),
  nameEn: text("name_en").notNull(),
  affiliationBg: text("affiliation_bg"),
  affiliationEn: text("affiliation_en"),
  status: scheduleItemStatusEnum("status").notNull().default("confirmed"),
  ...timestamps,
});

export const scheduleItemSpeakers = pgTable(
  "schedule_item_speakers",
  {
    itemId: text("item_id")
      .notNull()
      .references(() => scheduleItems.id, { onDelete: "cascade" }),
    speakerId: text("speaker_id")
      .notNull()
      .references(() => speakers.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.itemId, table.speakerId] }),
    index("schedule_item_speakers_item_sort_idx").on(
      table.itemId,
      table.sortOrder,
    ),
  ],
);
