"use client";

import { useActionState } from "react";
import { AdminField, AdminFormStatus } from "@/components/admin/form-controls";
import {
  createAdministratorAction,
  setTemporaryPasswordAction,
  type FormMessage,
} from "./actions";
import { setAdministratorActiveAction } from "./actions";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
};

export function CreateUserForm() {
  const [state, action, pending] = useActionState(
    createAdministratorAction,
    {} as FormMessage,
  );

  return (
    <form
      action={action}
      aria-describedby={state.error ? "create-user-error" : undefined}
      className="flex max-w-md flex-col gap-3"
    >
      <h2 className="text-lg font-semibold">Нов администратор</h2>
      <AdminField
        describedById={state.error ? "create-user-error" : undefined}
        error={state.error}
        id="create-email"
        label="Имейл"
        name="email"
        required
        type="email"
      />
      <AdminField
        describedById={state.error ? "create-user-error" : undefined}
        error={state.error}
        id="create-name"
        label="Име"
        name="name"
        required
        type="text"
      />
      <AdminField
        describedById={state.error ? "create-user-error" : undefined}
        error={state.error}
        hint="Минимум 12 символа."
        id="create-password"
        label="Парола"
        minLength={12}
        name="password"
        required
        type="password"
      />
      <AdminFormStatus
        id="create-user"
        error={state.error}
        success={state.success}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded bg-[#333333] px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? "Създаване…" : "Създай"}
      </button>
    </form>
  );
}

export function UserRowActions({
  person,
  currentUserId,
}: {
  person: AdminUser;
  currentUserId: string;
}) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    setTemporaryPasswordAction,
    {} as FormMessage,
  );
  const isSelf = person.id === currentUserId;
  const confirmId = `confirm-email-${person.id}`;
  const tempPasswordId = `temp-password-${person.id}`;
  const passwordStatusId = `temp-password-status-${person.id}`;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <form
        action={setAdministratorActiveAction}
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="userId" value={person.id} />
        <input
          type="hidden"
          name="active"
          value={person.active ? "false" : "true"}
        />
        {isSelf && person.active ? (
          <AdminField
            id={confirmId}
            label="Потвърдете имейла си, за да деактивирате собствения акаунт"
            name="confirmEmail"
            required
            type="email"
          />
        ) : null}
        <button type="submit" className="w-fit underline underline-offset-4">
          {person.active ? "Деактивирай" : "Активирай"}
        </button>
      </form>

      <form
        action={passwordAction}
        aria-describedby={
          passwordState.error ? `${passwordStatusId}-error` : undefined
        }
        className="flex flex-col gap-2"
      >
        <input type="hidden" name="userId" value={person.id} />
        <AdminField
          describedById={
            passwordState.error ? `${passwordStatusId}-error` : undefined
          }
          error={passwordState.error}
          hint="Минимум 12 символа."
          id={tempPasswordId}
          label="Временна парола"
          minLength={12}
          name="password"
          required
          type="password"
        />
        <AdminFormStatus
          id={passwordStatusId}
          error={passwordState.error}
          success={passwordState.success}
        />
        <button
          type="submit"
          disabled={passwordPending}
          className="w-fit underline underline-offset-4"
        >
          Задай временна парола
        </button>
      </form>
    </div>
  );
}
