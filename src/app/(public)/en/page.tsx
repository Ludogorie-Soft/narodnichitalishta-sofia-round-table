import type { Metadata } from "next";
import { ConferencePage } from "@/components/public/conference-page";
import { publicPageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return publicPageMetadata("en");
}

export default function EnglishHomePage() {
  return <ConferencePage locale="en" />;
}
