export function getAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set to a value of at least 32 characters.",
    );
  }
  return secret;
}

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function getAuthUrl(): string {
  return process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ?? getSiteUrl();
}

export function getTrustedOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:3000",
    "https://sofia-round-table.narodnichitalishta.bg",
    "https://*.vercel.app",
    getAuthUrl(),
  ]);

  const siteUrl = getSiteUrl();
  if (siteUrl) {
    origins.add(siteUrl);
  }

  return [...origins];
}
