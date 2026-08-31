"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createAdministrator,
  setAdministratorActive,
  setTemporaryPassword,
} from "@/lib/admin-users";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/permissions";
import { mutationErrorResult } from "@/lib/security";
import { requireAdminMutation } from "@/lib/session";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(MIN_ADMIN_PASSWORD_LENGTH),
});

export type FormMessage = {
  error?: string;
  success?: string;
};

export async function createAdministratorAction(
  _prev: FormMessage,
  formData: FormData,
): Promise<FormMessage> {
  try {
    const session = await requireAdminMutation({ sensitive: true });
    const parsed = createSchema.safeParse({
      email: formData.get("email"),
      name: formData.get("name"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return {
        error: "Проверете имейла, името и паролата (минимум 12 символа).",
      };
    }

    await createAdministrator({
      ...parsed.data,
      actorUserId: session.user.id,
    });
    revalidatePath("/admin/users");
    return { success: "Администраторът е създаден." };
  } catch (error) {
    return mutationErrorResult(error, "Неуспешно създаване.");
  }
}

export async function setAdministratorActiveAction(formData: FormData) {
  const session = await requireAdminMutation({ sensitive: true });
  const targetUserId = String(formData.get("userId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  const confirmEmail = String(formData.get("confirmEmail") ?? "");

  await setAdministratorActive({
    targetUserId,
    actorUserId: session.user.id,
    actorEmail: session.user.email,
    active,
    confirmEmail,
  });
  revalidatePath("/admin/users");
}

export async function setTemporaryPasswordAction(
  _prev: FormMessage,
  formData: FormData,
): Promise<FormMessage> {
  try {
    const session = await requireAdminMutation({ sensitive: true });
    const targetUserId = String(formData.get("userId") ?? "");
    const password = String(formData.get("password") ?? "");

    await setTemporaryPassword({
      targetUserId,
      actorUserId: session.user.id,
      password,
    });
    revalidatePath("/admin/users");
    return {
      success:
        "Зададена е временна парола. Сесиите на потребителя са прекратени.",
    };
  } catch (error) {
    return mutationErrorResult(error, "Неуспешна смяна на парола.");
  }
}
