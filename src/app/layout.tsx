import type { ReactNode } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sofia Round Table 2026",
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
      <body className="min-h-full flex flex-col bg-white text-[#333333]">
        {children}
      </body>
    </html>
  );
}
