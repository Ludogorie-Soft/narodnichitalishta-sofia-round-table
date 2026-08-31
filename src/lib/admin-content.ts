import "server-only";

import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { contentSections } from "@/db/schema";
import { richTextParagraphs, textToSanitizedDocument } from "@/lib/security";

export type AdminContentSection = {
  id: string;
  slug: string;
  headingBg: string;
  headingEn: string;
  bodyBg: string;
  bodyEn: string;
  visible: boolean;
};

function documentToText(value: unknown): string {
  return richTextParagraphs(value).join("\n\n");
}

export function textToDocument(value: string) {
  return textToSanitizedDocument(value);
}

export async function listAdminContentSections(): Promise<
  AdminContentSection[]
> {
  const rows = await getDb().query.contentSections.findMany({
    orderBy: [asc(contentSections.sortOrder)],
  });

  return rows.map((section) => ({
    id: section.id,
    slug: section.slug,
    headingBg: section.headingBg ?? "",
    headingEn: section.headingEn ?? "",
    bodyBg: documentToText(section.contentBg),
    bodyEn: documentToText(section.contentEn),
    visible: section.visible,
  }));
}
