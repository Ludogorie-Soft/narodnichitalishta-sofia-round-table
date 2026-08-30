import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";

export const contentSections = pgTable(
  "content_sections",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    headingBg: text("heading_bg"),
    headingEn: text("heading_en"),
    contentBg: jsonb("content_bg").$type<unknown>(),
    contentEn: jsonb("content_en").$type<unknown>(),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("content_sections_slug_idx").on(table.slug),
    index("content_sections_visible_sort_idx").on(
      table.visible,
      table.sortOrder,
    ),
  ],
);

export const navigationItems = pgTable(
  "navigation_items",
  {
    id: text("id").primaryKey(),
    labelBg: text("label_bg").notNull(),
    labelEn: text("label_en").notNull(),
    href: text("href").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("navigation_items_visible_sort_idx").on(
      table.visible,
      table.sortOrder,
    ),
  ],
);
