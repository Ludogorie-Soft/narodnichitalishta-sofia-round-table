/** Server and CLI only. Do not import from Client Components. */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add the Neon pooled connection string.",
    );
  }
  return url;
}

let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!cached) {
    cached = drizzle(neon(getDatabaseUrl()), { schema });
  }
  return cached;
}

export type Database = ReturnType<typeof getDb>;
