import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTrustedOrigins } from "@/lib/env";
import {
  assertActiveAdminSession,
  assertRateLimit,
  assertTrustedOrigin,
  MUTATION_RATE_LIMIT,
  SENSITIVE_MUTATION_RATE_LIMIT,
  UPLOAD_RATE_LIMIT,
  type AdminActor,
} from "@/lib/security";

export { assertActiveAdminSession };

export async function getAdminSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

async function enforceTrustedOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = (forwardedHost ?? headerList.get("host"))?.split(",")[0]?.trim();
  assertTrustedOrigin(origin, host ?? null, getTrustedOrigins());
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  try {
    return assertActiveAdminSession(session);
  } catch {
    if (session?.user && session.user.active === false) {
      await auth.api.signOut({
        headers: await headers(),
      });
    }
    redirect("/admin/login");
  }
}

export async function requireAdminMutation(options?: {
  sensitive?: boolean;
}): Promise<{ user: AdminActor }> {
  await enforceTrustedOrigin();
  const session = await getAdminSession();
  let active: { user: AdminActor };
  try {
    active = assertActiveAdminSession(session);
  } catch {
    if (session?.user && session.user.active === false) {
      await auth.api.signOut({
        headers: await headers(),
      });
    }
    redirect("/admin/login");
  }

  assertRateLimit(
    `${options?.sensitive ? "sensitive" : "mutation"}:${active.user.id}`,
    options?.sensitive ? SENSITIVE_MUTATION_RATE_LIMIT : MUTATION_RATE_LIMIT,
  );

  return active;
}

export async function requireAdminApi() {
  await enforceTrustedOrigin();
  const session = await getAdminSession();
  const active = assertActiveAdminSession(session);
  assertRateLimit(`upload:${active.user.id}`, UPLOAD_RATE_LIMIT);
  return active;
}
