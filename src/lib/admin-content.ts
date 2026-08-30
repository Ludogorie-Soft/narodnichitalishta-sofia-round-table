import "server-only";

import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { contentSections } from "@/db/schema";

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
  if (!value || typeof value !== "object" || !("content" in value)) {
    return "";
  }
  const content = value.content;
  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .flatMap((node) => {
      if (
        node &&
        typeof node === "object" &&
        "text" in node &&
        typeof node.text === "string"
      ) {
        return [node.text];
      }
      return [];
    })
    .join("\n\n");
}

export function textToDocument(value: string) {
  return {
    type: "doc" as const,
    content: value
      .split(/\n\s*\n/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ type: "paragraph" as const, text })),
  };
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
