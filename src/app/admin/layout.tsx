import type { ReactNode } from "react";
import type { Metadata } from "next";
import { SkipLink } from "@/components/ui/skip-link";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Администрация",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink>Към основното съдържание</SkipLink>
      {children}
    </>
  );
}
