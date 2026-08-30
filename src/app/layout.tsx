import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getSiteUrl } from "@/lib/env";
import { defaultLocale, isLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Sofia Round Table 2026",
    template: "%s",
  },
  description:
    "International conference: Culture as a Catalyst for Local and Regional Development. Sofia, 18–19 September 2026.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const headerList = await headers();
  const headerLocale = headerList.get("x-locale");
  const lang =
    headerLocale && isLocale(headerLocale) ? headerLocale : defaultLocale;

  return (
    <html lang={lang} className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
