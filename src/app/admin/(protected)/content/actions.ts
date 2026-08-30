"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { contentSections } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import { textToDocument } from "@/lib/admin-content";
import { revalidatePublicSite } from "@/lib/cache";
import { requireAdminSession } from "@/lib/session";

const contentSectionSchema = z.object({
  id: z.string().min(1).max(100),
  headingBg: z.string().trim().max(200),
  headingEn: z.string().trim().max(200),
  bodyBg: z.string().trim().max(30_000),
  bodyEn: z.string().trim().max(30_000),
  visible: z.boolean(),
});

export type SaveContentResult = {
  error?: string;
  success?: string;
};

export async function saveContentSectionAction(
  _previous: SaveContentResult,
  formData: FormData,
): Promise<SaveContentResult> {
  const session = await requireAdminSession();
  const parsed = contentSectionSchema.safeParse({
    id: formData.get("id"),
    headingBg: formData.get("headingBg"),
    headingEn: formData.get("headingEn"),
    bodyBg: formData.get("bodyBg"),
    bodyEn: formData.get("bodyEn"),
    visible: formData.get("visible") === "on",
  });

  if (!parsed.success) {
    return {
      error: "Проверете дължината на заглавията и текста и опитайте отново.",
    };
  }

  const db = getDb();
  const existing = await db.query.contentSections.findFirst({
    columns: { id: true, slug: true, visible: true },
    where: eq(contentSections.id, parsed.data.id),
  });

  if (!existing) {
    return { error: "Секцията не беше намерена." };
  }

  await db
    .update(contentSections)
    .set({
      headingBg: parsed.data.headingBg || null,
      headingEn: parsed.data.headingEn || null,
      contentBg: textToDocument(parsed.data.bodyBg),
      contentEn: textToDocument(parsed.data.bodyEn),
      visible: parsed.data.visible,
      updatedAt: new Date(),
    })
    .where(eq(contentSections.id, existing.id));

  await recordAudit({
    actorUserId: session.user.id,
    action: existing.visible !== parsed.data.visible ? "visibility" : "update",
    entityType: "content_section",
    entityId: existing.id,
    summary: `Редактирана секция „${parsed.data.headingBg || existing.slug}“.`,
  });

  revalidatePublicSite();
  revalidatePath("/admin");
  revalidatePath("/admin/content");

  return { success: "Промените са публикувани." };
}
