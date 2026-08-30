"use client";

import { useActionState } from "react";
import { AdminField, AdminFormStatus } from "@/components/admin/form-controls";
import type { FormMessage } from "./actions";
import { changeOwnPasswordAction } from "./actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    changeOwnPasswordAction,
    {} as FormMessage,
  );

  return (
    <form
      action={action}
      aria-describedby={state.error ? "password-error" : undefined}
      className="flex max-w-md flex-col gap-3"
    >
      <AdminField
        autoComplete="current-password"
        describedById={state.error ? "password-error" : undefined}
        error={state.error}
        id="current-password"
        label="Текуща парола"
        name="currentPassword"
        required
        type="password"
      />
      <AdminField
        autoComplete="new-password"
        describedById={state.error ? "password-error" : undefined}
        error={state.error}
        hint="Минимум 12 символа."
        id="new-password"
        label="Нова парола"
        minLength={12}
        name="newPassword"
        required
        type="password"
      />
      <AdminFormStatus
        id="password"
        error={state.error}
        success={state.success}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-[#333333] px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? "Запис…" : "Смени паролата"}
      </button>
    </form>
  );
}
