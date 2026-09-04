import { config } from "dotenv";
import { eq, notInArray } from "drizzle-orm";
import { getDb } from "../src/db";
import {
  contentSections,
  mediaAssets,
  navigationItems,
  partners,
  scheduleDays,
  scheduleItems,
  scheduleItemSpeakers,
  schedulePanels,
  siteSettings,
  speakers,
} from "../src/db/schema";
import {
  contentSectionSeeds,
  navigationItemSeeds,
  partnerLogoMediaSeeds,
  partnerSeeds,
  scheduleDaySeeds,
  scheduleItemSeeds,
  schedulePanelSeeds,
  siteSettingsSeed,
  speakerSeeds,
} from "./seed-data";
import { analyzeSeedData } from "./seed-report";

config({ path: ".env.local" });
config();

async function main() {
  const issues = analyzeSeedData();
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  if (errors.length > 0) {
    for (const issue of errors) {
      console.error(`[${issue.code}] ${issue.entity}: ${issue.message}`);
    }
    throw new Error("Seed data validation failed.");
  }

  const db = getDb();
  const now = new Date();

  await db
    .insert(siteSettings)
    .values(siteSettingsSeed)
    .onConflictDoUpdate({
      target: siteSettings.id,
      set: {
        timezone: siteSettingsSeed.timezone,
        startDate: siteSettingsSeed.startDate,
        endDate: siteSettingsSeed.endDate,
        cityBg: siteSettingsSeed.cityBg,
        cityEn: siteSettingsSeed.cityEn,
        venueNameBg: siteSettingsSeed.venueNameBg,
        venueNameEn: siteSettingsSeed.venueNameEn,
        venueAddressBg: siteSettingsSeed.venueAddressBg,
        venueAddressEn: siteSettingsSeed.venueAddressEn,
        mapUrl: siteSettingsSeed.mapUrl,
        venuePublished: siteSettingsSeed.venuePublished,
        updatedAt: now,
      },
    });

  for (const section of contentSectionSeeds) {
    await db
      .insert(contentSections)
      .values(section)
      .onConflictDoUpdate({
        target: contentSections.id,
        set: {
          slug: section.slug,
          headingBg: section.headingBg,
          headingEn: section.headingEn,
          contentBg: section.contentBg,
          contentEn: section.contentEn,
          sortOrder: section.sortOrder,
          visible: section.visible,
          updatedAt: now,
        },
      });
  }

  for (const item of navigationItemSeeds) {
    await db
      .insert(navigationItems)
      .values(item)
      .onConflictDoUpdate({
        target: navigationItems.id,
        set: {
          labelBg: item.labelBg,
          labelEn: item.labelEn,
          href: item.href,
          sortOrder: item.sortOrder,
          visible: item.visible,
          updatedAt: now,
        },
      });
  }

  for (const day of scheduleDaySeeds) {
    await db
      .insert(scheduleDays)
      .values(day)
      .onConflictDoUpdate({
        target: scheduleDays.id,
        set: {
          date: day.date,
          titleBg: day.titleBg,
          titleEn: day.titleEn,
          subtitleBg: day.subtitleBg,
          subtitleEn: day.subtitleEn,
          sortOrder: day.sortOrder,
          visible: day.visible,
          updatedAt: now,
        },
      });
  }

  for (const panel of schedulePanelSeeds) {
    await db
      .insert(schedulePanels)
      .values(panel)
      .onConflictDoUpdate({
        target: schedulePanels.id,
        set: {
          dayId: panel.dayId,
          startTime: panel.startTime,
          endTime: panel.endTime,
          titleBg: panel.titleBg,
          titleEn: panel.titleEn,
          descriptionBg: panel.descriptionBg,
          descriptionEn: panel.descriptionEn,
          sortOrder: panel.sortOrder,
          visible: panel.visible,
          updatedAt: now,
        },
      });
  }

  for (const speaker of speakerSeeds) {
    const speakerRow = {
      ...speaker,
      status: speaker.status ?? "confirmed",
    };
    await db
      .insert(speakers)
      .values(speakerRow)
      .onConflictDoUpdate({
        target: speakers.id,
        set: {
          nameBg: speakerRow.nameBg,
          nameEn: speakerRow.nameEn,
          affiliationBg: speakerRow.affiliationBg,
          affiliationEn: speakerRow.affiliationEn,
          status: speakerRow.status,
          updatedAt: now,
        },
      });
  }

  const itemRows = scheduleItemSeeds.map((seed) => {
    const { speakerIds, ...item } = seed;
    void speakerIds;
    return item;
  });
  const seedItemIds = itemRows.map((item) => item.id);
  const seedSpeakerIds = speakerSeeds.map((speaker) => speaker.id);

  for (const item of itemRows) {
    await db
      .insert(scheduleItems)
      .values(item)
      .onConflictDoUpdate({
        target: scheduleItems.id,
        set: {
          dayId: item.dayId,
          panelId: item.panelId,
          startTime: item.startTime,
          endTime: item.endTime,
          itemType: item.itemType,
          titleBg: item.titleBg,
          titleEn: item.titleEn,
          descriptionBg: item.descriptionBg,
          descriptionEn: item.descriptionEn,
          status: item.status,
          sortOrder: item.sortOrder,
          visible: item.visible,
          updatedAt: now,
        },
      });
  }

  await db.delete(scheduleItemSpeakers);

  const speakerLinks = scheduleItemSeeds.flatMap((item) =>
    item.speakerIds.map((speakerId, sortOrder) => ({
      itemId: item.id,
      speakerId,
      sortOrder,
    })),
  );
  if (speakerLinks.length > 0) {
    await db.insert(scheduleItemSpeakers).values(speakerLinks);
  }

  await db
    .delete(scheduleItems)
    .where(notInArray(scheduleItems.id, seedItemIds));
  await db.delete(speakers).where(notInArray(speakers.id, seedSpeakerIds));

  for (const logo of partnerLogoMediaSeeds) {
    await db.insert(mediaAssets).values(logo).onConflictDoNothing();
    await db
      .update(mediaAssets)
      .set({
        blobUrl: logo.blobUrl,
        blobPathname: logo.blobPathname,
        mimeType: logo.mimeType,
        width: logo.width,
        height: logo.height,
        altBg: logo.altBg,
        altEn: logo.altEn,
        updatedAt: now,
      })
      .where(eq(mediaAssets.id, logo.id));
  }

  for (const partner of partnerSeeds) {
    await db.insert(partners).values(partner).onConflictDoNothing();
    await db
      .update(partners)
      .set({
        mediaId: partner.mediaId,
        updatedAt: now,
      })
      .where(eq(partners.id, partner.id));
  }

  console.log("Seed complete. Schedule, venue, and public copy were synced.");
  if (warnings.length > 0) {
    console.warn(
      `${warnings.length} expected translation warning(s) remain in the temporary English draft:`,
    );
    for (const issue of warnings) {
      console.warn(`- ${issue.entity}: ${issue.message}`);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
