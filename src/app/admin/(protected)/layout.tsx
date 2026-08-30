import type { ReactNode } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { requireAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-full">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <p className="text-sm">
            {session.user.name} · {session.user.email}
            <span className="ml-2 rounded bg-neutral-100 px-2 py-0.5 text-xs">
              {process.env.NODE_ENV}
            </span>
          </p>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link className="underline underline-offset-4" href="/admin">
              Табло
            </Link>
            <Link className="underline underline-offset-4" href="/admin/users">
              Потребители
            </Link>
            <Link className="underline underline-offset-4" href="/admin/media">
              Медии
            </Link>
            <Link
              className="underline underline-offset-4"
              href="/admin/account"
            >
              Парола
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
