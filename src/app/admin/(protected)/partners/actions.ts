"use server";

import { asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { mediaAssets, partners } from "@/db/schema";
import { normalizeExternalUrl } from "@/lib/admin-validation";
import { recordAudit } from "@/lib/audit";
import { revalidatePublicSite } from "@/lib/cache";
import { mutationErrorResult } from "@/lib/security";
import { requireAdminMutation } from "@/lib/session";

const partnerSchema = z.object({
  id: z.string().max(100),
  name: z.string().trim().min(1).max(300),
  mediaId: z.string().max(100),
  url: z.string().trim().max(2_000),
  visible: z.boolean(),
});

export type PartnerFormState = { error?: string; success?: string };

function refreshPartners() {
  revalidatePublicSite();
  revalidatePath("/admin");
  revalidatePath("/admin/partners");
  revalidatePath("/admin/media");
}

export async function savePartnerAction(
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  try {
    const session = await requireAdminMutation();
    const parsed = partnerSchema.safeParse({
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      mediaId: String(formData.get("mediaId") ?? ""),
      url: String(formData.get("url") ?? ""),
      visible: formData.get("visible") === "on",
    });
    if (!parsed.success) return { error: "Името на партньора е задължително." };

    const db = getDb();
    const url = normalizeExternalUrl(parsed.data.url);
    const mediaId = parsed.data.mediaId || null;
    if (mediaId) {
      const media = await db.query.mediaAssets.findFirst({
        columns: { id: true },
        where: eq(mediaAssets.id, mediaId),
      });
      if (!media) return { error: "Избраното изображение не съществува." };
    }

    if (parsed.data.id) {
      const existing = await db.query.partners.findFirst({
        columns: { id: true, visible: true },
        where: eq(partners.id, parsed.data.id),
      });
      if (!existing) return { error: "Партньорът не беше намерен." };
      await db
        .update(partners)
        .set({
          name: parsed.data.name,
          mediaId,
          url,
          visible: parsed.data.visible,
          updatedAt: new Date(),
        })
        .where(eq(partners.id, existing.id));
      await recordAudit({
        actorUserId: session.user.id,
        action:
          existing.visible !== parsed.data.visible ? "visibility" : "update",
        entityType: "partner",
        entityId: existing.id,
        summary: `Редактиран партньор „${parsed.data.name}“.`,
      });
    } else {
      const result = await db
        .select({ highest: max(partners.sortOrder) })
        .from(partners);
      const highest = result[0]?.highest ?? -10;
      const id = crypto.randomUUID();
      await db.insert(partners).values({
        id,
        name: parsed.data.name,
        mediaId,
        url,
        visible: parsed.data.visible,
        sortOrder: highest + 10,
      });
      await recordAudit({
        actorUserId: session.user.id,
        action: "create",
        entityType: "partner",
        entityId: id,
        summary: `Създаден партньор „${parsed.data.name}“.`,
      });
    }
    refreshPartners();
    return { success: "Партньорът е публикуван." };
  } catch (error) {
    return mutationErrorResult(error, "Партньорът не беше запазен.");
  }
}

export async function movePartnerAction(formData: FormData) {
  const session = await requireAdminMutation();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || !["up", "down"].includes(direction)) return;

  const db = getDb();
  const ordered = await db.query.partners.findMany({
    columns: { id: true, name: true, sortOrder: true },
    orderBy: [asc(partners.sortOrder)],
  });
  const index = ordered.findIndex((partner) => partner.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) return;
  const current = ordered[index]!;
  const target = ordered[targetIndex]!;
  await Promise.all([
    db
      .update(partners)
      .set({ sortOrder: target.sortOrder, updatedAt: new Date() })
      .where(eq(partners.id, current.id)),
    db
      .update(partners)
      .set({ sortOrder: current.sortOrder, updatedAt: new Date() })
      .where(eq(partners.id, target.id)),
  ]);
  await recordAudit({
    actorUserId: session.user.id,
    action: "reorder",
    entityType: "partner",
    entityId: current.id,
    summary: `Преместен партньор „${current.name}“.`,
  });
  refreshPartners();
}

export async function deletePartnerAction(
  _previous: PartnerFormState,
  formData: FormData,
): Promise<PartnerFormState> {
  try {
    const session = await requireAdminMutation({ sensitive: true });
    const id = String(formData.get("id") ?? "");
    if (formData.get("confirmation") !== "DELETE") {
      return { error: "Въведете DELETE, за да потвърдите." };
    }
    const db = getDb();
    const existing = await db.query.partners.findFirst({
      where: eq(partners.id, id),
    });
    if (!existing) return { error: "Партньорът не беше намерен." };
    await db.delete(partners).where(eq(partners.id, id));
    await recordAudit({
      actorUserId: session.user.id,
      action: "delete",
      entityType: "partner",
      entityId: id,
      summary: `Изтрит партньор „${existing.name}“.`,
    });
    refreshPartners();
    return { success: "Партньорът е изтрит." };
  } catch (error) {
    return mutationErrorResult(error, "Партньорът не беше изтрит.");
  }
}
