import { config } from "dotenv";
import { getDb } from "../src/db";
import {
  contentSections,
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
  const inserted = {
    settings: await db
      .insert(siteSettings)
      .values(siteSettingsSeed)
      .onConflictDoNothing()
      .returning({ id: siteSettings.id }),
    content: await db
      .insert(contentSections)
      .values([...contentSectionSeeds])
      .onConflictDoNothing()
      .returning({ id: contentSections.id }),
    navigation: await db
      .insert(navigationItems)
      .values([...navigationItemSeeds])
      .onConflictDoNothing()
      .returning({ id: navigationItems.id }),
    partners: await db
      .insert(partners)
      .values([...partnerSeeds])
      .onConflictDoNothing()
      .returning({ id: partners.id }),
    days: await db
      .insert(scheduleDays)
      .values([...scheduleDaySeeds])
      .onConflictDoNothing()
      .returning({ id: scheduleDays.id }),
    panels: await db
      .insert(schedulePanels)
      .values([...schedulePanelSeeds])
      .onConflictDoNothing()
      .returning({ id: schedulePanels.id }),
    speakers: await db
      .insert(speakers)
      .values(speakerSeeds)
      .onConflictDoNothing()
      .returning({ id: speakers.id }),
  };

  const itemRows = scheduleItemSeeds.map((seed) => {
    const { speakerIds, ...item } = seed;
    void speakerIds;
    return item;
  });
  const insertedItems = await db
    .insert(scheduleItems)
    .values(itemRows)
    .onConflictDoNothing()
    .returning({ id: scheduleItems.id });

  const speakerLinks = scheduleItemSeeds.flatMap((item) =>
    item.speakerIds.map((speakerId, sortOrder) => ({
      itemId: item.id,
      speakerId,
      sortOrder,
    })),
  );
  const insertedSpeakerLinks = await db
    .insert(scheduleItemSpeakers)
    .values(speakerLinks)
    .onConflictDoNothing()
    .returning({ itemId: scheduleItemSpeakers.itemId });

  const insertedCount =
    Object.values(inserted).reduce((total, rows) => total + rows.length, 0) +
    insertedItems.length +
    insertedSpeakerLinks.length;

  console.log(`Seed complete. Inserted ${insertedCount} new records.`);
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
