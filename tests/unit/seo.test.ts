import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildEventJsonLd,
  buildRobots,
  buildSitemap,
  CONFERENCE_OG_IMAGE,
  publicPageMetadata,
  validateEventJsonLd,
} from "@/lib/seo";

const siteUrl = "https://sofia-round-table.narodnichitalishta.bg";

describe("public metadata", () => {
  it("uses language-specific titles, canonical URLs, and hreflang", () => {
    const bg = publicPageMetadata("bg");
    const en = publicPageMetadata("en");

    expect(bg.title).toMatch(/София 2026/);
    expect(en.title).toMatch(/Sofia 2026/);
    expect(bg.alternates?.canonical).toBe("/");
    expect(en.alternates?.canonical).toBe("/en");
    expect(bg.alternates?.languages).toMatchObject({
      bg: expect.stringMatching(/\/$/),
      en: expect.stringMatching(/\/en$/),
      "x-default": expect.stringMatching(/\/$/),
    });
    expect(bg.openGraph?.images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: CONFERENCE_OG_IMAGE.path }),
      ]),
    );
  });
});

describe("robots and sitemap", () => {
  it("excludes admin and authentication routes from indexing", () => {
    const robots = buildRobots(siteUrl);
    const rules = Array.isArray(robots.rules) ? robots.rules[0] : robots.rules;

    expect(rules?.allow).toBe("/");
    expect(rules?.disallow).toEqual(
      expect.arrayContaining(["/admin", "/api/auth", "/api/blob"]),
    );
    expect(robots.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });

  it("lists only the public language homepages", () => {
    const sitemap = buildSitemap(siteUrl);
    const urls = sitemap.map((entry) => entry.url);

    expect(urls).toEqual([`${siteUrl}/`, `${siteUrl}/en`]);
    expect(urls.join(" ")).not.toMatch(/admin|api\/auth/);
    expect(sitemap[0]?.alternates?.languages).toMatchObject({
      bg: `${siteUrl}/`,
      en: `${siteUrl}/en`,
      "x-default": `${siteUrl}/`,
    });
  });
});

describe("Event JSON-LD", () => {
  const base = {
    locale: "bg" as const,
    name: "Sofia Round Table",
    description: "Conference description",
    startDate: "2026-09-18",
    endDate: "2026-09-19",
    city: "София",
    imageUrl: absoluteUrl(CONFERENCE_OG_IMAGE.path, siteUrl),
    pageUrl: `${siteUrl}/`,
    organizerName: "Фондация „Народни читалища“",
    organizerUrl: "https://narodnichitalishta.bg/",
  };

  it("includes Sofia and omits unpublished venue details", () => {
    const data = buildEventJsonLd({
      ...base,
      venuePublished: false,
      venueName: "Secret Hall",
      venueAddress: "Hidden Street 1",
    });

    expect(data["@type"]).toBe("Event");
    expect(data.location.name).toBe("София");
    expect(data.location.address.addressLocality).toBe("София");
    expect(data.location.address.streetAddress).toBeUndefined();
    expect(data.inLanguage).toBe("bg");
    expect(data.image).toEqual([`${siteUrl}${CONFERENCE_OG_IMAGE.path}`]);
    expect(validateEventJsonLd(data, { venuePublished: false }).valid).toBe(
      true,
    );
  });

  it("adds venue name and address only after they are published", () => {
    const data = buildEventJsonLd({
      ...base,
      venuePublished: true,
      venueName: "Европейски парламент, Бюро за връзка",
      venueAddress: "ул. Георги С. Раковски 124",
    });

    expect(data.location.name).toBe("Европейски парламент, Бюро за връзка");
    expect(data.location.address.streetAddress).toBe(
      "ул. Георги С. Раковски 124",
    );
    expect(validateEventJsonLd(data, { venuePublished: true })).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects JSON-LD that is missing required Event fields", () => {
    const data = buildEventJsonLd({
      ...base,
      name: "",
      venuePublished: false,
    });

    const result = validateEventJsonLd(data);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Event name is required.");
  });
});
