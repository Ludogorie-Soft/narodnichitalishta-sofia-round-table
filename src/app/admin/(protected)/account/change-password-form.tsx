"use client";

import { useActionState } from "react";
import type { FormMessage } from "./actions";
import { changeOwnPasswordAction } from "./actions";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    changeOwnPasswordAction,
    {} as FormMessage,
  );

  return (
    <form action={action} className="flex max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Текуща парола
        <input
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Нова парола (минимум 12 символа)
        <input
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-800">{state.success}</p>
      ) : null}
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
