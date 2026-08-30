import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  integer,
  pgTable,
  text,
} from "drizzle-orm/pg-core";
import { timestamps } from "./columns";

export const siteSettings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    timezone: text("timezone").notNull().default("Europe/Sofia"),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }).notNull(),
    cityBg: text("city_bg").notNull().default("София"),
    cityEn: text("city_en").notNull().default("Sofia"),
    venueNameBg: text("venue_name_bg"),
    venueNameEn: text("venue_name_en"),
    venueAddressBg: text("venue_address_bg"),
    venueAddressEn: text("venue_address_en"),
    mapUrl: text("map_url"),
    venuePublished: boolean("venue_published").notNull().default(false),
    contactEmail: text("contact_email"),
    facebookUrl: text("facebook_url"),
    linkedinUrl: text("linkedin_url"),
    ngoHomeUrl: text("ngo_home_url"),
    chitalishtaMapUrl: text("chitalishta_map_url"),
    grantsUrl: text("grants_url"),
    dataUrl: text("data_url"),
    footerBlurbBg: text("footer_blurb_bg"),
    footerBlurbEn: text("footer_blurb_en"),
    copyrightBg: text("copyright_bg"),
    copyrightEn: text("copyright_en"),
    englishPublished: boolean("english_published").notNull().default(true),
    ...timestamps,
  },
  (table) => [check("site_settings_singleton_chk", sql`${table.id} = 1`)],
);
