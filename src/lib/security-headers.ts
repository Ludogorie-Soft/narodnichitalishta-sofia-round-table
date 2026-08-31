const BLOB_IMAGE_ORIGINS = "https://*.public.blob.vercel-storage.com";

export function contentSecurityPolicy(options?: { isDev?: boolean }): string {
  const isDev = options?.isDev ?? process.env.NODE_ENV === "development";

  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${BLOB_IMAGE_ORIGINS}`,
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (!isDev) {
    directives.push("upgrade-insecure-requests");
  }

  return directives
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export type SecurityHeader = { key: string; value: string };

export function securityHeaders(options?: {
  isDev?: boolean;
}): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy(options),
    },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
  ];

  if (!(options?.isDev ?? process.env.NODE_ENV === "development")) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}

export function applySecurityHeaders(
  headers: Headers,
  options?: { isDev?: boolean },
) {
  for (const header of securityHeaders(options)) {
    headers.set(header.key, header.value);
  }
}
