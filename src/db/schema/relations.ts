import { relations } from "drizzle-orm";
import { account, session, user } from "./auth";
import { auditLog } from "./audit";
import { mediaAssets, partners } from "./media";
import {
  scheduleDays,
  scheduleItemSpeakers,
  scheduleItems,
  schedulePanels,
  speakers,
} from "./schedule";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  auditLogs: many(auditLog),
  uploadedMedia: many(mediaAssets),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const mediaAssetRelations = relations(mediaAssets, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [mediaAssets.createdById],
    references: [user.id],
  }),
  partners: many(partners),
}));

export const partnerRelations = relations(partners, ({ one }) => ({
  media: one(mediaAssets, {
    fields: [partners.mediaId],
    references: [mediaAssets.id],
  }),
}));

export const scheduleDayRelations = relations(scheduleDays, ({ many }) => ({
  panels: many(schedulePanels),
  items: many(scheduleItems),
}));

export const schedulePanelRelations = relations(
  schedulePanels,
  ({ one, many }) => ({
    day: one(scheduleDays, {
      fields: [schedulePanels.dayId],
      references: [scheduleDays.id],
    }),
    items: many(scheduleItems),
  }),
);

export const scheduleItemRelations = relations(
  scheduleItems,
  ({ one, many }) => ({
    day: one(scheduleDays, {
      fields: [scheduleItems.dayId],
      references: [scheduleDays.id],
    }),
    panel: one(schedulePanels, {
      fields: [scheduleItems.panelId],
      references: [schedulePanels.id],
    }),
    speakers: many(scheduleItemSpeakers),
  }),
);

export const speakerRelations = relations(speakers, ({ many }) => ({
  scheduleItems: many(scheduleItemSpeakers),
}));

export const scheduleItemSpeakerRelations = relations(
  scheduleItemSpeakers,
  ({ one }) => ({
    item: one(scheduleItems, {
      fields: [scheduleItemSpeakers.itemId],
      references: [scheduleItems.id],
    }),
    speaker: one(speakers, {
      fields: [scheduleItemSpeakers.speakerId],
      references: [speakers.id],
    }),
  }),
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(user, {
    fields: [auditLog.actorUserId],
    references: [user.id],
  }),
}));
