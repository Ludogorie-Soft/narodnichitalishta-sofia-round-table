import { pgEnum } from "drizzle-orm/pg-core";
import { scheduleItemStatuses, scheduleItemTypes } from "../../lib/datetime";

export const scheduleItemTypeEnum = pgEnum(
  "schedule_item_type",
  scheduleItemTypes,
);

export const scheduleItemStatusEnum = pgEnum(
  "schedule_item_status",
  scheduleItemStatuses,
);
