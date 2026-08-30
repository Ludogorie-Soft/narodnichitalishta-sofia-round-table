import "server-only";

import { asc, desc } from "drizzle-orm";
import { getDb } from "@/db";
import { mediaAssets, partners } from "@/db/schema";
import { partnerBrandLogos } from "@/lib/partner-brand-logos";

export type AdminMediaChoice = {
  id: string;
  blobUrl: string;
  blobPathname: string;
  altBg: string | null;
  width: number | null;
  height: number | null;
  label: string;
};

function mergeMediaChoices(
  mediaRows: Array<{
    id: string;
    blobUrl: string;
    blobPathname: string;
    altBg: string | null;
    width: number | null;
    height: number | null;
  }>,
): AdminMediaChoice[] {
  const byId = new Map<string, AdminMediaChoice>();

  for (const logo of partnerBrandLogos) {
    byId.set(logo.id, {
      id: logo.id,
      blobUrl: logo.src,
      blobPathname: logo.blobPathname,
      altBg: logo.altBg,
      width: logo.width,
      height: logo.height,
      label: logo.label,
    });
  }

  for (const asset of mediaRows) {
    byId.set(asset.id, {
      ...asset,
      label: asset.altBg || asset.blobPathname,
    });
  }

  return [...byId.values()].sort((left, right) =>
    left.label.localeCompare(right.label, "bg"),
  );
}

export async function getAdminPartnersData() {
  const db = getDb();
  const [partnerRows, mediaRows] = await Promise.all([
    db.query.partners.findMany({
      orderBy: [asc(partners.sortOrder)],
      with: { media: true },
    }),
    db.query.mediaAssets.findMany({
      orderBy: [desc(mediaAssets.createdAt)],
    }),
  ]);
  return {
    partners: partnerRows,
    media: mergeMediaChoices(mediaRows),
  };
}
