import type { Metadata } from "next";
import { ConferencePage } from "@/components/public/conference-page";
import { publicPageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return publicPageMetadata("bg");
}

export default function HomePage() {
  return <ConferencePage locale="bg" />;
}
