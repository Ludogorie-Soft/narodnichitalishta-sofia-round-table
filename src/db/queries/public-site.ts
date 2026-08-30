import "server-only";

import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  contentSections,
  navigationItems,
  partners,
  scheduleDays,
  scheduleItems,
  scheduleItemSpeakers,
  schedulePanels,
  siteSettings,
} from "@/db/schema";
import type { ScheduleItemStatus, ScheduleItemType } from "@/lib/datetime";
import type { Locale } from "@/lib/i18n";

type PublicSpeaker = {
  id: string;
  name: string;
  affiliation: string | null;
  contentLocale: Locale;
};

export type PublicScheduleItem = {
  id: string;
  panelId: string | null;
  startTime: string | null;
  endTime: string | null;
  type: ScheduleItemType;
  status: ScheduleItemStatus;
  title: string;
  description: string | null;
  contentLocale: Locale;
  sortOrder: number;
  speakers: PublicSpeaker[];
};

export type PublicSchedulePanel = {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string | null;
  contentLocale: Locale;
  sortOrder: number;
  items: PublicScheduleItem[];
};

export type PublicScheduleDay = {
  id: string;
  date: string;
  title: string;
  subtitle: string | null;
  contentLocale: Locale;
  sortOrder: number;
  panels: PublicSchedulePanel[];
  ungroupedItems: PublicScheduleItem[];
};

export type PublicPartner = {
  id: string;
  name: string;
  url: string | null;
  image: {
    url: string;
    width: number | null;
    height: number | null;
    alt: string;
  } | null;
};

export type PublicSiteData = {
  sections: Record<
    string,
    { heading: string | null; paragraphs: string[]; contentLocale: Locale }
  >;
  navigation: Array<{ label: string; href: string }>;
  partners: PublicPartner[];
  schedule: PublicScheduleDay[];
  settings: {
    timezone: string;
    venuePublished: boolean;
    venueName: string | null;
    venueAddress: string | null;
    mapUrl: string | null;
    footerBlurb: string | null;
    copyright: string | null;
    contactEmail: string | null;
    facebookUrl: string | null;
    linkedinUrl: string | null;
    ngoHomeUrl: string | null;
    chitalishtaMapUrl: string | null;
    grantsUrl: string | null;
    dataUrl: string | null;
  };
};

function localized(
  locale: Locale,
  bg: string | null,
  en: string | null,
): { value: string | null; contentLocale: Locale } {
  if (locale === "en" && en?.trim()) {
    return { value: en, contentLocale: "en" };
  }
  return { value: bg?.trim() || null, contentLocale: "bg" };
}

function richTextParagraphs(value: unknown): string[] {
  if (!value || typeof value !== "object" || !("content" in value)) {
    return [];
  }

  const content = (value as { content?: unknown }).content;
  if (!Array.isArray(content)) {
    return [];
  }

  return content.flatMap((node) => {
    if (
      node &&
      typeof node === "object" &&
      "text" in node &&
      typeof node.text === "string"
    ) {
      return [node.text];
    }
    return [];
  });
}

export async function getPublicSiteData(
  locale: Locale,
): Promise<PublicSiteData> {
  const db = getDb();
  const [
    settingsRecord,
    sectionRecords,
    navigationRecords,
    partnerRecords,
    days,
  ] = await Promise.all([
    db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, 1),
    }),
    db.query.contentSections.findMany({
      where: eq(contentSections.visible, true),
      orderBy: [asc(contentSections.sortOrder)],
    }),
    db.query.navigationItems.findMany({
      where: eq(navigationItems.visible, true),
      orderBy: [asc(navigationItems.sortOrder)],
    }),
    db.query.partners.findMany({
      where: eq(partners.visible, true),
      orderBy: [asc(partners.sortOrder)],
      with: { media: true },
    }),
    db.query.scheduleDays.findMany({
      where: eq(scheduleDays.visible, true),
      orderBy: [asc(scheduleDays.sortOrder)],
      with: {
        panels: {
          where: eq(schedulePanels.visible, true),
          orderBy: [asc(schedulePanels.sortOrder)],
        },
        items: {
          where: eq(scheduleItems.visible, true),
          orderBy: [asc(scheduleItems.sortOrder)],
          with: {
            speakers: {
              orderBy: [asc(scheduleItemSpeakers.sortOrder)],
              with: { speaker: true },
            },
          },
        },
      },
    }),
  ]);

  if (!settingsRecord) {
    throw new Error("Public site settings have not been seeded.");
  }

  const sections = Object.fromEntries(
    sectionRecords.map((section) => {
      const heading = localized(locale, section.headingBg, section.headingEn);
      const content =
        locale === "en" && section.contentEn
          ? {
              paragraphs: richTextParagraphs(section.contentEn),
              contentLocale: "en" as const,
            }
          : {
              paragraphs: richTextParagraphs(section.contentBg),
              contentLocale: "bg" as const,
            };

      return [
        section.slug,
        {
          heading: heading.value,
          paragraphs: content.paragraphs,
          contentLocale: content.contentLocale,
        },
      ];
    }),
  );

  const mapItem = (
    item: (typeof days)[number]["items"][number],
  ): PublicScheduleItem => {
    const title = localized(locale, item.titleBg, item.titleEn);
    const description = localized(
      locale,
      item.descriptionBg,
      item.descriptionEn,
    );

    return {
      id: item.id,
      panelId: item.panelId,
      startTime: item.startTime,
      endTime: item.endTime,
      type: item.itemType,
      status: item.status,
      title: title.value ?? "",
      description: description.value,
      contentLocale: title.contentLocale,
      sortOrder: item.sortOrder,
      speakers: item.speakers.map(({ speaker }) => {
        const name = localized(locale, speaker.nameBg, speaker.nameEn);
        const affiliation = localized(
          locale,
          speaker.affiliationBg,
          speaker.affiliationEn,
        );
        return {
          id: speaker.id,
          name: name.value ?? "",
          affiliation: affiliation.value,
          contentLocale: name.contentLocale,
        };
      }),
    };
  };

  return {
    sections,
    navigation: navigationRecords.map((item) => ({
      label: locale === "bg" ? item.labelBg : item.labelEn,
      href: item.href,
    })),
    partners: partnerRecords.map((partner) => ({
      id: partner.id,
      name: partner.name,
      url: partner.url,
      image: partner.media
        ? {
            url: partner.media.blobUrl,
            width: partner.media.width,
            height: partner.media.height,
            alt:
              (locale === "bg" ? partner.media.altBg : partner.media.altEn) ??
              "",
          }
        : null,
    })),
    schedule: days.map((day) => {
      const title = localized(locale, day.titleBg, day.titleEn);
      const subtitle = localized(locale, day.subtitleBg, day.subtitleEn);
      const items = day.items.map(mapItem);

      return {
        id: day.id,
        date: day.date,
        title: title.value ?? "",
        subtitle: subtitle.value,
        contentLocale: title.contentLocale,
        sortOrder: day.sortOrder,
        panels: day.panels.map((panel) => {
          const panelTitle = localized(locale, panel.titleBg, panel.titleEn);
          const panelDescription = localized(
            locale,
            panel.descriptionBg,
            panel.descriptionEn,
          );
          return {
            id: panel.id,
            startTime: panel.startTime,
            endTime: panel.endTime,
            title: panelTitle.value ?? "",
            description: panelDescription.value,
            contentLocale: panelTitle.contentLocale,
            sortOrder: panel.sortOrder,
            items: items.filter((item) => item.panelId === panel.id),
          };
        }),
        ungroupedItems: items.filter((item) => !item.panelId),
      };
    }),
    settings: {
      timezone: settingsRecord.timezone,
      venuePublished: settingsRecord.venuePublished,
      venueName: localized(
        locale,
        settingsRecord.venueNameBg,
        settingsRecord.venueNameEn,
      ).value,
      venueAddress: localized(
        locale,
        settingsRecord.venueAddressBg,
        settingsRecord.venueAddressEn,
      ).value,
      mapUrl: settingsRecord.mapUrl,
      footerBlurb:
        locale === "bg"
          ? settingsRecord.footerBlurbBg
          : settingsRecord.footerBlurbEn?.trim() || null,
      copyright:
        locale === "bg"
          ? settingsRecord.copyrightBg
          : settingsRecord.copyrightEn?.trim() || null,
      contactEmail: settingsRecord.contactEmail,
      facebookUrl: settingsRecord.facebookUrl,
      linkedinUrl: settingsRecord.linkedinUrl,
      ngoHomeUrl: settingsRecord.ngoHomeUrl,
      chitalishtaMapUrl: settingsRecord.chitalishtaMapUrl,
      grantsUrl: settingsRecord.grantsUrl,
      dataUrl: settingsRecord.dataUrl,
    },
  };
}
