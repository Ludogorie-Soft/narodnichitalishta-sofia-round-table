"use client";

import { useActionState, useRef, useState } from "react";
import { saveGeneralSettingsAction, type GeneralFormState } from "./actions";

type Settings = {
  startDate: string;
  endDate: string;
  timezone: string;
  cityBg: string;
  cityEn: string;
  venueNameBg: string | null;
  venueNameEn: string | null;
  venueAddressBg: string | null;
  venueAddressEn: string | null;
  mapUrl: string | null;
  contactEmail: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  ngoHomeUrl: string | null;
  chitalishtaMapUrl: string | null;
  grantsUrl: string | null;
  dataUrl: string | null;
  footerBlurbBg: string | null;
  footerBlurbEn: string | null;
  copyrightBg: string | null;
  copyrightEn: string | null;
  venuePublished: boolean;
  englishPublished: boolean;
};

const fieldClass =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-conference-green focus:outline-none focus:ring-2 focus:ring-conference-green/20";

function Field({
  label,
  name,
  value,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input
        className={fieldClass}
        defaultValue={value ?? ""}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

export function GeneralForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState(
    saveGeneralSettingsAction,
    {} as GeneralFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<Record<string, string> | null>(null);

  function updatePreview() {
    if (!formRef.current) return;
    setPreview(
      Object.fromEntries(
        [...new FormData(formRef.current).entries()].map(([key, value]) => [
          key,
          String(value),
        ]),
      ),
    );
  }

  return (
    <form action={action} className="space-y-8" ref={formRef}>
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold">Събитие</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            label="Начална дата"
            name="startDate"
            required
            type="date"
            value={settings.startDate}
          />
          <Field
            label="Крайна дата"
            name="endDate"
            required
            type="date"
            value={settings.endDate}
          />
          <Field
            label="Часова зона"
            name="timezone"
            required
            value={settings.timezone}
          />
          <Field
            label="Град (BG)"
            name="cityBg"
            required
            value={settings.cityBg}
          />
          <Field
            label="City (EN)"
            name="cityEn"
            required
            value={settings.cityEn}
          />
          <Field
            label="Контактен имейл"
            name="contactEmail"
            type="email"
            value={settings.contactEmail}
          />
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
          <input
            defaultChecked={settings.englishPublished}
            name="englishPublished"
            type="checkbox"
          />
          Публикувай английската версия
        </label>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold">
          Място на провеждане
        </h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <fieldset className="space-y-4">
            <legend className="font-bold">Български</legend>
            <Field
              label="Име"
              name="venueNameBg"
              value={settings.venueNameBg}
            />
            <Field
              label="Адрес"
              name="venueAddressBg"
              value={settings.venueAddressBg}
            />
          </fieldset>
          <fieldset className="space-y-4">
            <legend className="font-bold">English</legend>
            <Field
              label="Name"
              name="venueNameEn"
              value={settings.venueNameEn}
            />
            <Field
              label="Address"
              name="venueAddressEn"
              value={settings.venueAddressEn}
            />
          </fieldset>
        </div>
        <div className="mt-5">
          <Field
            label="Адрес към карта"
            name="mapUrl"
            type="url"
            value={settings.mapUrl}
          />
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
          <input
            defaultChecked={settings.venuePublished}
            name="venuePublished"
            type="checkbox"
          />
          Покажи мястото на публичния сайт
        </label>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold">
          Публични и социални връзки
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {(
            [
              ["Facebook", "facebookUrl", settings.facebookUrl],
              ["LinkedIn", "linkedinUrl", settings.linkedinUrl],
              ["Основен сайт", "ngoHomeUrl", settings.ngoHomeUrl],
              [
                "Карта на читалищата",
                "chitalishtaMapUrl",
                settings.chitalishtaMapUrl,
              ],
              ["Грантове", "grantsUrl", settings.grantsUrl],
              ["Данни", "dataUrl", settings.dataUrl],
            ] satisfies Array<[string, string, string | null]>
          ).map(([label, name, value]) => (
            <Field
              key={name}
              label={label}
              name={name}
              type="url"
              value={value}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold">Footer</h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {(["Bg", "En"] as const).map((locale) => (
            <fieldset className="space-y-4" key={locale}>
              <legend className="font-bold">
                {locale === "Bg" ? "Български" : "English"}
              </legend>
              <label className="block text-sm font-semibold">
                Кратък текст
                <textarea
                  className={`${fieldClass} min-h-28`}
                  defaultValue={settings[`footerBlurb${locale}`] ?? ""}
                  name={`footerBlurb${locale}`}
                />
              </label>
              <Field
                label="Copyright"
                name={`copyright${locale}`}
                value={settings[`copyright${locale}`]}
              />
            </fieldset>
          ))}
        </div>
      </section>

      {preview ? (
        <section
          aria-live="polite"
          className="grid gap-4 rounded-2xl border-2 border-conference-green bg-white p-6 lg:grid-cols-2"
        >
          {(["Bg", "En"] as const).map((locale) => (
            <div key={locale}>
              <p className="text-xs font-bold uppercase">{locale}</p>
              <h2 className="mt-2 text-xl font-semibold">
                {preview[`venueName${locale}`] || "—"}
              </h2>
              <p>{preview[`venueAddress${locale}`] || "—"}</p>
              <p className="mt-5 text-sm">
                {preview[`footerBlurb${locale}`] || "—"}
              </p>
              <p className="mt-2 text-xs">
                {preview[`copyright${locale}`] || "—"}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <button
          className="rounded-lg border border-conference-green px-4 py-2 text-sm font-bold text-conference-green"
          onClick={updatePreview}
          type="button"
        >
          Преглед преди запазване
        </button>
        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-800" role="status">
            {state.success}
          </p>
        ) : null}
        <button
          className="ml-auto rounded-lg bg-conference-green px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Запазване…" : "Запази и публикувай"}
        </button>
      </div>
    </form>
  );
}
