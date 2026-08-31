export class AuthorizationError extends Error {
  readonly code = "unauthorized" as const;

  constructor() {
    super("Unauthorized.");
    this.name = "AuthorizationError";
  }
}

export class OriginError extends Error {
  readonly code = "origin" as const;

  constructor() {
    super("Origin is not trusted.");
    this.name = "OriginError";
  }
}

export class RateLimitError extends Error {
  readonly code = "rate_limited" as const;

  constructor() {
    super("Too many requests.");
    this.name = "RateLimitError";
  }
}

export type AdminActor = {
  id: string;
  email: string;
  name: string;
};

export type AdminSessionLike = {
  user?: {
    id?: string;
    email?: string;
    name?: string | null;
    active?: boolean;
    role?: unknown;
  };
} | null;

export function assertActiveAdminSession(session: AdminSessionLike): {
  user: AdminActor;
} {
  const user = session?.user;
  if (!user?.id || !user.email) {
    throw new AuthorizationError();
  }
  if (user.active === false) {
    throw new AuthorizationError();
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? "",
    },
  };
}

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const SECRET_ASSIGNMENT =
  /((?:password|passwd|secret|token|authorization|api[_-]?key|database_url|connection(?:string)?)\s*[:=]\s*)([^\s&]+)/gi;
const POSTGRES_CREDENTIALS = /(postgres(?:ql)?:\/\/)([^@/\s]+)@/gi;

export function redactForLog(value: string): string {
  return value
    .replace(POSTGRES_CREDENTIALS, "$1[redacted]@")
    .replace(SECRET_ASSIGNMENT, "$1[redacted]")
    .replace(EMAIL_PATTERN, "[redacted-email]");
}

export function logServerError(error: unknown, context: string) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";
  console.error(`[${context}]`, redactForLog(message));
}

function looksLikeInternalError(message: string): boolean {
  return (
    message.includes("\n") ||
    message.length > 280 ||
    /postgres|drizzle|neon|relation |failed query|syntax error|ECONN|ETIMEDOUT|ENOTFOUND|password|secret|token|stack|BETTER_AUTH|DATABASE_URL|at\s+\S+\s+\(/i.test(
      message,
    )
  );
}

function isSafeUserMessage(message: string): boolean {
  if (!message || looksLikeInternalError(message)) {
    return false;
  }
  if (/[\u0400-\u04FF]/.test(message)) {
    return true;
  }
  return /^(Choose |The image |The uploaded |Bulgarian and English |Only JPEG|Type DELETE)/.test(
    message,
  );
}

export function isNextControlFlowError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }
  const digest = String(error.digest);
  return (
    digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")
  );
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AuthorizationError) {
    return "Нямате достъп. Влезте отново.";
  }
  if (error instanceof OriginError) {
    return "Заявката е отхвърлена.";
  }
  if (error instanceof RateLimitError) {
    return "Твърде много опити. Опитайте отново след минута.";
  }
  if (error instanceof Error && isSafeUserMessage(error.message)) {
    return error.message;
  }
  return fallback;
}

export function mutationErrorResult(
  error: unknown,
  fallback: string,
): { error: string } {
  if (isNextControlFlowError(error)) {
    throw error;
  }
  logServerError(error, "admin-mutation");
  return { error: publicErrorMessage(error, fallback) };
}

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

export const MUTATION_RATE_LIMIT = { windowMs: 60_000, max: 60 } as const;
export const SENSITIVE_MUTATION_RATE_LIMIT = {
  windowMs: 10 * 60_000,
  max: 10,
} as const;
export const UPLOAD_RATE_LIMIT = { windowMs: 10 * 60_000, max: 20 } as const;

export function resetRateLimitStore() {
  rateBuckets.clear();
}

export function assertRateLimit(
  key: string,
  limit: { windowMs: number; max: number },
) {
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + limit.windowMs });
    return;
  }
  if (current.count >= limit.max) {
    throw new RateLimitError();
  }
  current.count += 1;
}

export function originMatchesTrusted(
  origin: string,
  trustedOrigins: string[],
): boolean {
  let normalized: string;
  try {
    const url = new URL(origin);
    normalized = `${url.protocol}//${url.host}`;
  } catch {
    return false;
  }

  return trustedOrigins.some((trusted) => {
    const pattern = trusted.replace(/\/$/, "");
    if (!pattern.includes("*")) {
      return pattern === normalized;
    }
    const escaped = pattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, "[^.]+");
    return new RegExp(`^${escaped}$`, "i").test(normalized);
  });
}

export function assertTrustedOrigin(
  origin: string | null,
  host: string | null,
  trustedOrigins: string[],
) {
  if (origin) {
    if (!originMatchesTrusted(origin, trustedOrigins)) {
      throw new OriginError();
    }
    return;
  }

  if (!host) {
    throw new OriginError();
  }

  const candidates = [`https://${host}`, `http://${host}`];
  if (
    !candidates.some((candidate) =>
      originMatchesTrusted(candidate, trustedOrigins),
    )
  ) {
    throw new OriginError();
  }
}

const SAFE_HREF_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);

export function sanitizeHref(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("#") ||
    (trimmed.startsWith("/") && !trimmed.startsWith("//"))
  ) {
    if (
      /[\s<>'"\\]/.test(trimmed) ||
      trimmed.toLowerCase().startsWith("/javascript:")
    ) {
      return null;
    }
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (!SAFE_HREF_PROTOCOLS.has(url.protocol)) {
      return null;
    }
    if (url.protocol === "mailto:" && !url.pathname.includes("@")) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeMailto(
  email: string | null | undefined,
): string | null {
  if (!email) return null;
  const trimmed = email.trim();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(trimmed)) {
    return null;
  }
  return `mailto:${trimmed}`;
}

export type SanitizedRichText = {
  type: "doc";
  content: Array<{ type: "paragraph"; text: string }>;
};

function stripUnsafeText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}

function paragraphTexts(value: unknown): string[] {
  if (!value || typeof value !== "object") {
    return [];
  }
  if ("content" in value && Array.isArray(value.content)) {
    return value.content.flatMap((node) => paragraphTexts(node));
  }
  if (
    "text" in value &&
    typeof value.text === "string" &&
    (!("type" in value) || value.type === "paragraph" || value.type === "text")
  ) {
    const text = stripUnsafeText(value.text);
    return text ? [text] : [];
  }
  return [];
}

export function sanitizeRichText(value: unknown): SanitizedRichText {
  return {
    type: "doc",
    content: paragraphTexts(value).map((text) => ({
      type: "paragraph",
      text,
    })),
  };
}

export function richTextParagraphs(value: unknown): string[] {
  return sanitizeRichText(value).content.map((node) => node.text);
}

export function textToSanitizedDocument(value: string): SanitizedRichText {
  return sanitizeRichText({
    type: "doc",
    content: value
      .split(/\n\s*\n/)
      .map((text) => stripUnsafeText(text))
      .filter(Boolean)
      .map((text) => ({ type: "paragraph", text })),
  });
}
