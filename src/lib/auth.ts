/** Server and CLI only. Do not import from Client Components. */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import * as schema from "@/db/schema";
import { getAuthSecret, getAuthUrl, getTrustedOrigins } from "@/lib/env";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/permissions";

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  appName: "Sofia Round Table",
  baseURL: getAuthUrl(),
  secret: getAuthSecret(),
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema,
  }),
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: MIN_ADMIN_PASSWORD_LENGTH,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      active: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/change-password": {
        window: 60,
        max: 5,
      },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: [
        "x-forwarded-for",
        "x-real-ip",
        "x-vercel-forwarded-for",
      ],
    },
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [account] = await getDb()
            .select({ active: user.active })
            .from(user)
            .where(eq(user.id, session.userId))
            .limit(1);

          if (!account?.active) {
            throw new APIError("FORBIDDEN", {
              message: "Този акаунт е деактивиран.",
            });
          }

          return { data: session };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
