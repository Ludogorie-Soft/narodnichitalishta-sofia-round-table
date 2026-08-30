import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getAdminSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session?.user) {
    redirect("/admin/login");
  }

  if (session.user.active === false) {
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/admin/login");
  }

  return session;
}
