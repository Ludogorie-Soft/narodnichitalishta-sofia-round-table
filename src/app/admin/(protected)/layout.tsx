import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNavigation } from "@/components/admin/admin-navigation";
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
    <div className="min-h-screen bg-neutral-50 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen flex-col bg-conference-green p-5 text-white lg:flex">
        <div>
          <p className="font-display text-xl font-semibold">
            Sofia Round Table
          </p>
          <p className="mt-1 text-xs tracking-wide text-white uppercase">
            Администрация
          </p>
        </div>

        <div className="mt-8">
          <AdminNavigation />
        </div>

        <div className="mt-auto space-y-4 border-t border-white/15 pt-5 text-sm">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase">
            {process.env.NODE_ENV}
          </span>
          <Link
            className="block text-white underline underline-offset-4 hover:text-white"
            href="/"
          >
            Към публичния сайт
          </Link>
          <SignOutButton className="text-white hover:text-white" />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white lg:hidden">
          <div className="flex min-h-16 items-center gap-4 px-4">
            <Link
              className="mr-auto font-display font-semibold text-conference-green"
              href="/admin"
            >
              Sofia Round Table
            </Link>
            <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold uppercase">
              {process.env.NODE_ENV}
            </span>
            <details className="group relative">
              <summary className="cursor-pointer list-none rounded-lg border border-neutral-300 px-3 py-2 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                Меню
              </summary>
              <div className="absolute right-0 top-12 w-64 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl">
                <p className="mb-3 border-b border-neutral-200 px-2 pb-3 text-xs text-neutral-600">
                  <span className="block font-semibold text-neutral-900">
                    {session.user.name}
                  </span>
                  <span className="block break-all">{session.user.email}</span>
                </p>
                <AdminNavigation mobile />
                <div className="mt-3 border-t border-neutral-200 pt-3">
                  <SignOutButton />
                </div>
              </div>
            </details>
          </div>
        </header>

        <header className="hidden border-b border-neutral-200 bg-white lg:block">
          <div className="flex min-h-16 items-center justify-end px-8">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-neutral-900">
                {session.user.name}
              </span>{" "}
              · {session.user.email}
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
