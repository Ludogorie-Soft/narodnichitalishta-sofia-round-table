import type { EventJsonLd } from "@/lib/seo";

export function EventJsonLd({ data }: { data: EventJsonLd }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}
