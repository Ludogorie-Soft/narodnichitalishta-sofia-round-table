import "server-only";

import { del } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets, partners } from "@/db/schema";
import { recordAudit } from "@/lib/audit";

export type MediaAssetListItem = {
  id: string;
  blobUrl: string;
  blobPathname: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altBg: string | null;
  altEn: string | null;
  createdAt: Date;
  usageCount: number;
};

export async function listMediaAssets(): Promise<MediaAssetListItem[]> {
  const records = await getDb().query.mediaAssets.findMany({
    orderBy: [desc(mediaAssets.createdAt)],
    with: {
      partners: {
        columns: { id: true },
      },
    },
  });

  return records.map(({ partners: assetPartners, ...asset }) => ({
    ...asset,
    usageCount: assetPartners.length,
  }));
}

export async function createMediaAsset(input: {
  id: string;
  blobUrl: string;
  blobPathname: string;
  mimeType: string;
  width: number;
  height: number;
  altBg: string | null;
  altEn: string | null;
  actorUserId: string;
}) {
  await getDb().insert(mediaAssets).values({
    id: input.id,
    blobUrl: input.blobUrl,
    blobPathname: input.blobPathname,
    mimeType: input.mimeType,
    width: input.width,
    height: input.height,
    altBg: input.altBg,
    altEn: input.altEn,
    createdById: input.actorUserId,
  });

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "create",
    entityType: "media_asset",
    entityId: input.id,
    summary: `Uploaded ${input.blobPathname}`,
  });
}

export async function deleteMediaAsset(input: {
  id: string;
  actorUserId: string;
}): Promise<{ blobDeleted: boolean }> {
  const db = getDb();
  const [asset] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, input.id))
    .limit(1);

  if (!asset) {
    throw new Error("Media asset not found.");
  }

  const [reference] = await db
    .select({ id: partners.id })
    .from(partners)
    .where(eq(partners.mediaId, input.id))
    .limit(1);

  if (reference) {
    throw new Error(
      "This image is still used by a partner and cannot be deleted.",
    );
  }

  const deleted = await db
    .delete(mediaAssets)
    .where(eq(mediaAssets.id, input.id))
    .returning({ id: mediaAssets.id });

  if (deleted.length === 0) {
    throw new Error("Media asset not found.");
  }

  let blobDeleted = true;
  try {
    await del(asset.blobPathname);
  } catch {
    blobDeleted = false;
  }

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "delete",
    entityType: "media_asset",
    entityId: input.id,
    summary: blobDeleted
      ? `Deleted ${asset.blobPathname}`
      : `Deleted media record; Blob cleanup required for ${asset.blobPathname}`,
  });

  return { blobDeleted };
}
