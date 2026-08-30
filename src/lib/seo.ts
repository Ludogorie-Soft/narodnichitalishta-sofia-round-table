import type { Metadata, MetadataRoute } from "next";
import { getDictionary } from "@/lib/dictionaries";
import { getSiteUrl } from "@/lib/env";
import type { Locale } from "@/lib/i18n";
import { publicPathForLocale } from "@/lib/i18n";

export const CONFERENCE_OG_IMAGE = {
  path: "/brand/hero-bridge-makers.png",
  width: 1056,
  height: 480,
} as const;

export function absoluteUrl(path: string, siteUrl = getSiteUrl()): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

export function languageAlternates(siteUrl = getSiteUrl()) {
  return {
    bg: absoluteUrl("/", siteUrl),
    en: absoluteUrl("/en", siteUrl),
    "x-default": absoluteUrl("/", siteUrl),
  };
}

export function publicPageMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  const path = publicPathForLocale(locale);
  const pageUrl = absoluteUrl(path);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: path,
      languages: languageAlternates(),
    },
    openGraph: {
      type: "website",
      locale: locale === "bg" ? "bg_BG" : "en_GB",
      url: pageUrl,
      siteName: dict.meta.siteName,
      title: dict.meta.title,
      description: dict.meta.description,
      images: [
        {
          url: CONFERENCE_OG_IMAGE.path,
          width: CONFERENCE_OG_IMAGE.width,
          height: CONFERENCE_OG_IMAGE.height,
          alt: dict.meta.ogAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [CONFERENCE_OG_IMAGE.path],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function buildRobots(siteUrl = getSiteUrl()): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/auth", "/api/blob"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

export function buildSitemap(siteUrl = getSiteUrl()): MetadataRoute.Sitemap {
  const languages = languageAlternates(siteUrl);
  return [
    {
      url: absoluteUrl("/", siteUrl),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: absoluteUrl("/en", siteUrl),
      lastModified: new Date("2026-09-18"),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages },
    },
  ];
}

export type EventJsonLdInput = {
  locale: Locale;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city: string;
  imageUrl: string;
  pageUrl: string;
  organizerName: string;
  organizerUrl?: string | null;
  venuePublished: boolean;
  venueName?: string | null;
  venueAddress?: string | null;
};

export type EventJsonLd = {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  eventStatus: "https://schema.org/EventScheduled";
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode";
  inLanguage: Locale;
  url: string;
  image: string[];
  organizer: {
    "@type": "Organization";
    name: string;
    url?: string;
  };
  location: {
    "@type": "Place";
    name: string;
    address: {
      "@type": "PostalAddress";
      addressLocality: string;
      addressCountry: "BG";
      streetAddress?: string;
    };
  };
};

export function buildEventJsonLd(input: EventJsonLdInput): EventJsonLd {
  const venueKnown = Boolean(
    input.venuePublished &&
    (input.venueName?.trim() || input.venueAddress?.trim()),
  );
  const locationName = venueKnown
    ? input.venueName?.trim() || input.city
    : input.city;
  const streetAddress = venueKnown
    ? input.venueAddress?.trim() || undefined
    : undefined;

  const organizer: EventJsonLd["organizer"] = {
    "@type": "Organization",
    name: input.organizerName,
  };
  if (input.organizerUrl?.trim()) {
    organizer.url = input.organizerUrl;
  }

  const location: EventJsonLd["location"] = {
    "@type": "Place",
    name: locationName,
    address: {
      "@type": "PostalAddress",
      addressLocality: input.city,
      addressCountry: "BG",
    },
  };
  if (streetAddress) {
    location.address.streetAddress = streetAddress;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    inLanguage: input.locale,
    url: input.pageUrl,
    image: [input.imageUrl],
    organizer,
    location,
  };
}

export function validateEventJsonLd(
  data: EventJsonLd,
  options: { venuePublished: boolean } = { venuePublished: false },
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data["@type"] !== "Event") {
    errors.push("JSON-LD type must be Event.");
  }
  if (!data.name?.trim()) {
    errors.push("Event name is required.");
  }
  if (!data.startDate) {
    errors.push("Event startDate is required.");
  }
  if (!data.endDate) {
    errors.push("Event endDate is required.");
  }
  if (!data.inLanguage) {
    errors.push("Event inLanguage is required.");
  }
  if (!data.image?.length) {
    errors.push("Event image is required.");
  }
  if (!data.organizer?.name?.trim()) {
    errors.push("Organizer name is required.");
  }
  if (!data.location?.address?.addressLocality?.trim()) {
    errors.push("Event location must include Sofia (addressLocality).");
  }
  if (data.location?.address?.addressCountry !== "BG") {
    errors.push("Event location country must be BG.");
  }

  if (options.venuePublished) {
    if (!data.location?.name?.trim()) {
      errors.push("Published venue requires a location name.");
    }
    if (
      !data.location?.address?.streetAddress?.trim() &&
      data.location?.name === data.location?.address?.addressLocality
    ) {
      errors.push(
        "Published venue requires a venue name or street address beyond the city.",
      );
    }
  } else if (data.location?.address?.streetAddress) {
    errors.push("Unpublished venue address must not appear in JSON-LD.");
  }

  return { valid: errors.length === 0, errors };
}
