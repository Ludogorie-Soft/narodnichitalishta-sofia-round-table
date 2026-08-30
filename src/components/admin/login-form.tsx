"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminField, AdminFormStatus } from "@/components/admin/form-controls";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    setPending(false);

    if (signInError) {
      setError("Невалиден имейл или парола, или акаунтът е деактивиран.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form
      action={onSubmit}
      aria-describedby={error ? "login-error" : undefined}
      className="flex flex-col gap-4"
    >
      <AdminField
        autoComplete="username"
        describedById={error ? "login-error" : undefined}
        error={error ?? undefined}
        id="login-email"
        label="Имейл"
        name="email"
        required
        type="email"
      />
      <AdminField
        autoComplete="current-password"
        describedById={error ? "login-error" : undefined}
        error={error ?? undefined}
        id="login-password"
        label="Парола"
        name="password"
        required
        type="password"
      />
      <AdminFormStatus id="login" error={error ?? undefined} />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#333333] px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? "Влизане…" : "Вход"}
      </button>
    </form>
  );
}
