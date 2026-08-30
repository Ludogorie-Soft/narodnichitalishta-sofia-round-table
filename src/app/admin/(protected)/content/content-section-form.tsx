"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import {
  AdminField,
  AdminFormStatus,
  AdminTextarea,
} from "@/components/admin/form-controls";
import type { AdminContentSection } from "@/lib/admin-content";
import { saveContentSectionAction, type SaveContentResult } from "./actions";

const publicAnchors: Record<string, string> = {
  hero: "home",
  introduction: "about",
  organizers: "organizers",
  funding: "organizers",
};

export function ContentSectionForm({
  section,
}: {
  section: AdminContentSection;
}) {
  const [state, action, pending] = useActionState(
    saveContentSectionAction,
    {} as SaveContentResult,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  const anchor = publicAnchors[section.slug] ?? section.slug;

  function showPreview() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    setPreview({
      headingBg: String(data.get("headingBg") ?? ""),
      headingEn: String(data.get("headingEn") ?? ""),
      bodyBg: String(data.get("bodyBg") ?? ""),
      bodyEn: String(data.get("bodyEn") ?? ""),
    });
  }

  return (
    <form
      action={action}
      aria-describedby={state.error ? `${section.id}-error` : undefined}
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
      ref={formRef}
    >
      <input name="id" type="hidden" value={section.id} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">
            {section.slug}
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold">
            {section.headingBg || "Секция без заглавие"}
          </h2>
        </div>
        <div className="flex gap-3 text-sm">
          <Link
            className="font-semibold text-conference-green underline underline-offset-4"
            href={`/#${anchor}`}
            target="_blank"
          >
            BG преглед
          </Link>
          <Link
            className="font-semibold text-conference-green underline underline-offset-4"
            href={`/en#${anchor}`}
            target="_blank"
          >
            EN преглед
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <fieldset className="min-w-0 space-y-4">
          <legend className="mb-3 rounded-full bg-neutral-100 px-3 py-1 text-sm font-bold">
            Български
          </legend>
          <AdminField
            describedById={state.error ? `${section.id}-error` : undefined}
            defaultValue={section.headingBg}
            error={state.error}
            id={`${section.id}-heading-bg`}
            label="Заглавие"
            maxLength={200}
            name="headingBg"
          />
          <AdminTextarea
            defaultValue={section.bodyBg}
            id={`${section.id}-body-bg`}
            label="Текст"
            maxLength={30_000}
            minHeightClassName="min-h-52"
            name="bodyBg"
          />
        </fieldset>

        <fieldset className="min-w-0 space-y-4">
          <legend className="mb-3 rounded-full bg-neutral-100 px-3 py-1 text-sm font-bold">
            English
          </legend>
          <AdminField
            describedById={state.error ? `${section.id}-error` : undefined}
            defaultValue={section.headingEn}
            error={state.error}
            id={`${section.id}-heading-en`}
            label="Heading"
            maxLength={200}
            name="headingEn"
          />
          <AdminTextarea
            defaultValue={section.bodyEn}
            id={`${section.id}-body-en`}
            label="Text"
            maxLength={30_000}
            minHeightClassName="min-h-52"
            name="bodyEn"
          />
        </fieldset>
      </div>

      <p className="mt-4 text-xs text-neutral-500">
        Оставете празен ред между абзаците. HTML кодът се запазва като обикновен
        текст.
      </p>

      {preview ? (
        <div
          aria-live="polite"
          className="mt-5 grid gap-5 rounded-xl bg-neutral-50 p-4 lg:grid-cols-2"
        >
          {(["Bg", "En"] as const).map((locale) => (
            <div key={locale} lang={locale.toLowerCase()}>
              <p className="text-xs font-bold uppercase">{locale}</p>
              <h3 className="mt-2 text-lg font-semibold">
                {preview[`heading${locale}`] || "—"}
              </h3>
              <div className="mt-2 space-y-2 text-sm">
                {(preview[`body${locale}`] || "—")
                  .split(/\n\s*\n/)
                  .map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-neutral-200 pt-5">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            className="size-4 accent-conference-green"
            defaultChecked={section.visible}
            name="visible"
            type="checkbox"
          />
          Видима на сайта
        </label>
        <button
          className="rounded-lg border border-conference-green px-4 py-2 text-sm font-bold text-conference-green"
          onClick={showPreview}
          type="button"
        >
          BG/EN преглед
        </button>
        <button
          className="ml-auto rounded-lg bg-conference-green px-5 py-2.5 text-sm font-bold text-white hover:bg-conference-green/90 disabled:cursor-wait disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Запазване…" : "Запази и публикувай"}
        </button>
      </div>

      <AdminFormStatus
        id={section.id}
        error={state.error}
        success={state.success}
      />
    </form>
  );
}
