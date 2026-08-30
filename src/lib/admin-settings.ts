import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";

export async function getAdminSettings() {
  const settings = await getDb().query.siteSettings.findFirst({
    where: eq(siteSettings.id, 1),
  });
  if (!settings) throw new Error("Настройките на сайта не са създадени.");
  return settings;
}
