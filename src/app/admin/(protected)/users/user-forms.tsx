"use client";

import { useActionState } from "react";
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
    <form action={action} className="flex max-w-md flex-col gap-3">
      <h2 className="text-lg font-semibold">Нов администратор</h2>
      <label className="flex flex-col gap-1 text-sm">
        Имейл
        <input
          name="email"
          type="email"
          required
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Име
        <input
          name="name"
          type="text"
          required
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Парола (минимум 12 символа)
        <input
          name="password"
          type="password"
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
          <label className="flex flex-col gap-1">
            Потвърдете имейла си, за да деактивирате собствения акаунт
            <input
              name="confirmEmail"
              type="email"
              required
              className="rounded border border-neutral-300 px-3 py-2"
            />
          </label>
        ) : null}
        <button type="submit" className="w-fit underline underline-offset-4">
          {person.active ? "Деактивирай" : "Активирай"}
        </button>
      </form>

      <form action={passwordAction} className="flex flex-col gap-2">
        <input type="hidden" name="userId" value={person.id} />
        <label className="flex flex-col gap-1">
          Временна парола
          <input
            name="password"
            type="password"
            minLength={12}
            required
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        {passwordState.error ? (
          <p role="alert" className="text-red-700">
            {passwordState.error}
          </p>
        ) : null}
        {passwordState.success ? (
          <p className="text-green-800">{passwordState.success}</p>
        ) : null}
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
