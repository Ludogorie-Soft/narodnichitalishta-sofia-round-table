"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/permissions";
import { requireAdminSession } from "@/lib/session";

export type FormMessage = {
  error?: string;
  success?: string;
};

export async function changeOwnPasswordAction(
  _prev: FormMessage,
  formData: FormData,
): Promise<FormMessage> {
  const session = await requireAdminSession();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (newPassword.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return {
      error: `Новата парола трябва да е поне ${MIN_ADMIN_PASSWORD_LENGTH} символа.`,
    };
  }

  try {
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });

    await recordAudit({
      actorUserId: session.user.id,
      action: "user.password.change",
      entityType: "user",
      entityId: session.user.id,
      summary: `Changed own password for ${session.user.email}`,
    });

    return { success: "Паролата е сменена." };
  } catch {
    return { error: "Текущата парола е грешна или смяната не е възможна." };
  }
}
