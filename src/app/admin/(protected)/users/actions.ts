"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createAdministrator,
  setAdministratorActive,
  setTemporaryPassword,
} from "@/lib/admin-users";
import { MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/permissions";
import { requireAdminSession } from "@/lib/session";

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
  const session = await requireAdminSession();
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

  try {
    await createAdministrator({
      ...parsed.data,
      actorUserId: session.user.id,
    });
    revalidatePath("/admin/users");
    return { success: "Администраторът е създаден." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Неуспешно създаване.",
    };
  }
}

export async function setAdministratorActiveAction(formData: FormData) {
  const session = await requireAdminSession();
  const targetUserId = String(formData.get("userId") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  const confirmEmail = String(formData.get("confirmEmail") ?? "");

  try {
    await setAdministratorActive({
      targetUserId,
      actorUserId: session.user.id,
      actorEmail: session.user.email,
      active,
      confirmEmail,
    });
    revalidatePath("/admin/users");
  } catch (error) {
    throw error;
  }
}

export async function setTemporaryPasswordAction(
  _prev: FormMessage,
  formData: FormData,
): Promise<FormMessage> {
  const session = await requireAdminSession();
  const targetUserId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
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
    return {
      error:
        error instanceof Error ? error.message : "Неуспешна смяна на парола.",
    };
  }
}
