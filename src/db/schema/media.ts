import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { timestamps } from "./columns";

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    blobUrl: text("blob_url").notNull(),
    blobPathname: text("blob_pathname").notNull(),
    mimeType: text("mime_type").notNull(),
    width: integer("width"),
    height: integer("height"),
    altBg: text("alt_bg"),
    altEn: text("alt_en"),
    createdById: text("created_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("media_assets_blob_pathname_idx").on(table.blobPathname),
    index("media_assets_created_by_idx").on(table.createdById),
  ],
);

export const partners = pgTable(
  "partners",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    mediaId: text("media_id").references(() => mediaAssets.id, {
      onDelete: "restrict",
    }),
    url: text("url"),
    sortOrder: integer("sort_order").notNull().default(0),
    visible: boolean("visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("partners_visible_sort_idx").on(table.visible, table.sortOrder),
    index("partners_media_id_idx").on(table.mediaId),
  ],
);
