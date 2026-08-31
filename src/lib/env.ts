import { z } from "zod";

const postgresUrl = z
  .string()
  .trim()
  .min(1, "DATABASE_URL is not set.")
  .refine(
    (value) =>
      value.startsWith("postgres://") || value.startsWith("postgresql://"),
    "DATABASE_URL must be a PostgreSQL connection string.",
  );

const authSecret = z
  .string()
  .trim()
  .min(
    32,
    "BETTER_AUTH_SECRET must be set to a value of at least 32 characters.",
  );

const originUrl = z
  .string()
  .trim()
  .url("Public site and auth URLs must be valid origins.")
  .transform((value) => value.replace(/\/$/, ""));

export type ServerEnv = {
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  BLOB_READ_WRITE_TOKEN?: string;
};

function optionalOrigin(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function parseServerEnv(
  env: Record<string, string | undefined> = process.env,
): ServerEnv {
  const isProduction = env.NODE_ENV === "production";
  const parsed = z
    .object({
      DATABASE_URL: postgresUrl,
      BETTER_AUTH_SECRET: authSecret,
      BETTER_AUTH_URL: isProduction ? originUrl : originUrl.optional(),
      NEXT_PUBLIC_SITE_URL: isProduction ? originUrl : originUrl.optional(),
      BLOB_READ_WRITE_TOKEN: z.string().trim().min(1).optional(),
    })
    .safeParse({
      DATABASE_URL: env.DATABASE_URL,
      BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: optionalOrigin(env.BETTER_AUTH_URL),
      NEXT_PUBLIC_SITE_URL: optionalOrigin(env.NEXT_PUBLIC_SITE_URL),
      BLOB_READ_WRITE_TOKEN: optionalOrigin(env.BLOB_READ_WRITE_TOKEN),
    });

  if (!parsed.success) {
    const messages = parsed.error.issues.map((issue) => issue.message);
    throw new Error(`Invalid environment configuration: ${messages.join(" ")}`);
  }

  return parsed.data;
}

export function assertServerEnv(
  env: Record<string, string | undefined> = process.env,
): ServerEnv {
  return parseServerEnv(env);
}

export function getAuthSecret(): string {
  return authSecret.parse(process.env.BETTER_AUTH_SECRET);
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
    "http://127.0.0.1:3000",
    "https://sofia-round-table.narodnichitalishta.bg",
    "https://*.vercel.app",
    getAuthUrl(),
    getSiteUrl(),
  ]);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    origins.add(`https://${vercelUrl.replace(/^https?:\/\//, "")}`);
  }

  return [...origins];
}
