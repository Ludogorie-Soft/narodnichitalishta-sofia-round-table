"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { normalizeExternalUrl } from "@/lib/admin-validation";
import { recordAudit } from "@/lib/audit";
import { revalidatePublicSite } from "@/lib/cache";
import { mutationErrorResult } from "@/lib/security";
import { requireAdminMutation } from "@/lib/session";

const nullableText = z.string().trim().max(2_000);
const schema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
  timezone: z.string().trim().min(1).max(100),
  cityBg: z.string().trim().min(1).max(200),
  cityEn: z.string().trim().min(1).max(200),
  venueNameBg: nullableText,
  venueNameEn: nullableText,
  venueAddressBg: nullableText,
  venueAddressEn: nullableText,
  mapUrl: nullableText,
  contactEmail: z.union([z.literal(""), z.string().email()]),
  facebookUrl: nullableText,
  linkedinUrl: nullableText,
  ngoHomeUrl: nullableText,
  chitalishtaMapUrl: nullableText,
  grantsUrl: nullableText,
  dataUrl: nullableText,
  footerBlurbBg: nullableText,
  footerBlurbEn: nullableText,
  copyrightBg: nullableText,
  copyrightEn: nullableText,
  venuePublished: z.boolean(),
  englishPublished: z.boolean(),
});

export type GeneralFormState = { error?: string; success?: string };

const text = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

export async function saveGeneralSettingsAction(
  _previous: GeneralFormState,
  formData: FormData,
): Promise<GeneralFormState> {
  try {
    const session = await requireAdminMutation();
    const parsed = schema.safeParse({
      startDate: text(formData, "startDate"),
      endDate: text(formData, "endDate"),
      timezone: text(formData, "timezone"),
      cityBg: text(formData, "cityBg"),
      cityEn: text(formData, "cityEn"),
      venueNameBg: text(formData, "venueNameBg"),
      venueNameEn: text(formData, "venueNameEn"),
      venueAddressBg: text(formData, "venueAddressBg"),
      venueAddressEn: text(formData, "venueAddressEn"),
      mapUrl: text(formData, "mapUrl"),
      contactEmail: text(formData, "contactEmail"),
      facebookUrl: text(formData, "facebookUrl"),
      linkedinUrl: text(formData, "linkedinUrl"),
      ngoHomeUrl: text(formData, "ngoHomeUrl"),
      chitalishtaMapUrl: text(formData, "chitalishtaMapUrl"),
      grantsUrl: text(formData, "grantsUrl"),
      dataUrl: text(formData, "dataUrl"),
      footerBlurbBg: text(formData, "footerBlurbBg"),
      footerBlurbEn: text(formData, "footerBlurbEn"),
      copyrightBg: text(formData, "copyrightBg"),
      copyrightEn: text(formData, "copyrightEn"),
      venuePublished: formData.get("venuePublished") === "on",
      englishPublished: formData.get("englishPublished") === "on",
    });

    if (!parsed.success) {
      return { error: "Проверете задължителните полета, датите и имейла." };
    }
    if (parsed.data.endDate < parsed.data.startDate) {
      return { error: "Крайната дата не може да бъде преди началната." };
    }
    try {
      new Intl.DateTimeFormat("en", {
        timeZone: parsed.data.timezone,
      }).format();
    } catch {
      return { error: "Въведете валидна IANA часова зона." };
    }

    const urlFields = {
      mapUrl: normalizeExternalUrl(parsed.data.mapUrl),
      facebookUrl: normalizeExternalUrl(parsed.data.facebookUrl),
      linkedinUrl: normalizeExternalUrl(parsed.data.linkedinUrl),
      ngoHomeUrl: normalizeExternalUrl(parsed.data.ngoHomeUrl),
      chitalishtaMapUrl: normalizeExternalUrl(parsed.data.chitalishtaMapUrl),
      grantsUrl: normalizeExternalUrl(parsed.data.grantsUrl),
      dataUrl: normalizeExternalUrl(parsed.data.dataUrl),
    };
    const nullable = (value: string) => value || null;

    await getDb()
      .update(siteSettings)
      .set({
        ...parsed.data,
        ...urlFields,
        venueNameBg: nullable(parsed.data.venueNameBg),
        venueNameEn: nullable(parsed.data.venueNameEn),
        venueAddressBg: nullable(parsed.data.venueAddressBg),
        venueAddressEn: nullable(parsed.data.venueAddressEn),
        contactEmail: nullable(parsed.data.contactEmail),
        footerBlurbBg: nullable(parsed.data.footerBlurbBg),
        footerBlurbEn: nullable(parsed.data.footerBlurbEn),
        copyrightBg: nullable(parsed.data.copyrightBg),
        copyrightEn: nullable(parsed.data.copyrightEn),
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.id, 1));

    await recordAudit({
      actorUserId: session.user.id,
      action: "update",
      entityType: "site_settings",
      entityId: "1",
      summary: "Общите настройки и долният колонтитул са редактирани.",
    });
    revalidatePublicSite();
    revalidatePath("/admin");
    revalidatePath("/admin/general");
    return { success: "Настройките са публикувани." };
  } catch (error) {
    return mutationErrorResult(error, "Настройките не бяха запазени.");
  }
}
