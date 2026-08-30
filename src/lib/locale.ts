import { headers } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const headerList = await headers();
  const value = headerList.get("x-locale");
  return value && isLocale(value) ? value : defaultLocale;
}
