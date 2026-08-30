import Link from "next/link";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { requireAdminSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const dashboard = await getAdminDashboardData();
  const dateFormatter = new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  });

  return (
    <main className="flex flex-col gap-8" id="main-content" tabIndex={-1}>
      <div>
        <p className="text-sm font-semibold text-conference-green">
          Здравейте, {session.user.name}
        </p>
        <h1 className="font-display mt-1 text-3xl font-semibold">Табло</h1>
        <p className="mt-2 text-neutral-600">
          Преглед на готовността на публичния сайт и последните промени.
        </p>
      </div>

      <section
        aria-label="Състояние на сайта"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-neutral-600">Преводи</p>
          <p className="mt-2 text-3xl font-bold text-conference-green">
            {dashboard.translationWarnings.length}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            непълни двуезични полета
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-neutral-600">Програма</p>
          <p className="mt-2 text-3xl font-bold text-conference-green">
            {dashboard.scheduleWarnings.length}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            проблема с часове или застъпвания
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-neutral-600">
            Място на провеждане
          </p>
          <p className="mt-3 text-lg font-bold text-conference-green">
            {dashboard.venue.published
              ? dashboard.venue.complete
                ? "Публикувано"
                : "Публикувано, но непълно"
              : "Скрито"}
          </p>
          <p className="mt-1 text-sm text-neutral-600">
            {!dashboard.venue.complete
              ? "Очакват се име и адрес на двата езика."
              : "Данните за мястото са попълнени."}
          </p>
        </article>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="warnings-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2
              className="font-display text-xl font-semibold"
              id="warnings-heading"
            >
              Предупреждения
            </h2>
            <Link
              className="text-sm font-semibold text-conference-green underline underline-offset-4"
              href="/en"
            >
              Преглед на EN
            </Link>
          </div>

          {dashboard.translationWarnings.length === 0 &&
          dashboard.scheduleWarnings.length === 0 ? (
            <p className="mt-5 text-sm text-emerald-800">
              Няма открити проблеми.
            </p>
          ) : (
            <ul className="mt-5 space-y-3 text-sm">
              {[...dashboard.scheduleWarnings, ...dashboard.translationWarnings]
                .slice(0, 8)
                .map((warning) => (
                  <li
                    className="rounded-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-amber-950"
                    key={warning}
                  >
                    {warning}
                  </li>
                ))}
            </ul>
          )}
          {dashboard.translationWarnings.length +
            dashboard.scheduleWarnings.length >
          8 ? (
            <p className="mt-4 text-xs text-muted">
              Показани са първите 8 предупреждения.
            </p>
          ) : null}
        </section>

        <section
          aria-labelledby="activity-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
        >
          <h2
            className="font-display text-xl font-semibold"
            id="activity-heading"
          >
            Последна активност
          </h2>
          {dashboard.recentActivity.length === 0 ? (
            <p className="mt-5 text-sm text-neutral-600">
              Все още няма записани административни промени.
            </p>
          ) : (
            <ol className="mt-5 divide-y divide-neutral-100">
              {dashboard.recentActivity.map((entry) => (
                <li className="py-3 first:pt-0" key={entry.id}>
                  <p className="text-sm">{entry.summary}</p>
                  <p className="mt-1 text-xs text-muted">
                    {entry.actorName ?? "Система"} ·{" "}
                    {dateFormatter.format(entry.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
