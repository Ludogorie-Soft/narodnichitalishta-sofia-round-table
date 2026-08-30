export const partnerBrandLogos = [
  {
    id: "media-partner-nc-logo",
    partnerId: "partner-narodnichitalishta",
    src: "/brand/nc-logo.png",
    blobPathname: "brand/nc-logo.png",
    mimeType: "image/png",
    width: 787,
    height: 200,
    label: "Фондация „Народни читалища“",
    altBg: "Лого на Фондация „Народни читалища“",
    altEn: "Narodni Chitalishta Foundation logo",
  },
  {
    id: "media-partner-encc-logo",
    partnerId: "partner-encc",
    src: "/brand/encc-logo.png",
    blobPathname: "brand/encc-logo.png",
    mimeType: "image/png",
    width: 1536,
    height: 922,
    label: "ENCC",
    altBg: "Лого на Европейската мрежа на културните центрове (ENCC)",
    altEn: "European Network of Cultural Centres (ENCC) logo",
  },
  {
    id: "media-partner-sofia-logo",
    partnerId: "partner-sofia",
    src: "/brand/sofia-municipality-crest.jpg",
    blobPathname: "brand/sofia-municipality-crest.jpg",
    mimeType: "image/jpeg",
    width: 150,
    height: 170,
    label: "Столична община",
    altBg: "Герб на Столична община",
    altEn: "Coat of arms of Sofia Municipality",
  },
  {
    id: "media-partner-european-parliament-logo",
    partnerId: "partner-european-parliament",
    src: "/brand/european-parliament-logo.png",
    blobPathname: "brand/european-parliament-logo.png",
    mimeType: "image/png",
    width: 1365,
    height: 1076,
    label: "Европейски парламент",
    altBg: "Лого на Европейския парламент",
    altEn: "European Parliament logo",
  },
] as const;

export function partnerBrandLogoByPartnerId(partnerId: string) {
  return partnerBrandLogos.find((logo) => logo.partnerId === partnerId);
}

export function partnerBrandLogoMediaSeeds() {
  return partnerBrandLogos.map((logo) => ({
    id: logo.id,
    blobUrl: logo.src,
    blobPathname: logo.blobPathname,
    mimeType: logo.mimeType,
    width: logo.width,
    height: logo.height,
    altBg: logo.altBg,
    altEn: logo.altEn,
  }));
}
