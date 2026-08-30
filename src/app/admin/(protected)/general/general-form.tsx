"use client";

import { useActionState, useRef, useState } from "react";
import {
  AdminField,
  AdminFormStatus,
  AdminTextarea,
} from "@/components/admin/form-controls";
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
    <form
      action={action}
      aria-describedby={state.error ? "general-form-error" : undefined}
      className="space-y-8"
      ref={formRef}
    >
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold">Събитие</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdminField
            describedById={state.error ? "general-form-error" : undefined}
            error={state.error}
            id="startDate"
            label="Начална дата"
            name="startDate"
            required
            type="date"
            defaultValue={settings.startDate}
          />
          <AdminField
            describedById={state.error ? "general-form-error" : undefined}
            error={state.error}
            id="endDate"
            label="Крайна дата"
            name="endDate"
            required
            type="date"
            defaultValue={settings.endDate}
          />
          <AdminField
            describedById={state.error ? "general-form-error" : undefined}
            error={state.error}
            id="timezone"
            label="Часова зона"
            name="timezone"
            required
            defaultValue={settings.timezone}
          />
          <AdminField
            describedById={state.error ? "general-form-error" : undefined}
            error={state.error}
            id="cityBg"
            label="Град (BG)"
            name="cityBg"
            required
            defaultValue={settings.cityBg}
          />
          <AdminField
            describedById={state.error ? "general-form-error" : undefined}
            error={state.error}
            id="cityEn"
            label="City (EN)"
            name="cityEn"
            required
            defaultValue={settings.cityEn}
          />
          <AdminField
            describedById={state.error ? "general-form-error" : undefined}
            error={state.error}
            id="contactEmail"
            label="Контактен имейл"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail}
          />
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
          <input
            defaultChecked={settings.englishPublished}
            id="englishPublished"
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
            <AdminField
              id="venueNameBg"
              label="Име"
              name="venueNameBg"
              defaultValue={settings.venueNameBg}
            />
            <AdminField
              id="venueAddressBg"
              label="Адрес"
              name="venueAddressBg"
              defaultValue={settings.venueAddressBg}
            />
          </fieldset>
          <fieldset className="space-y-4">
            <legend className="font-bold">English</legend>
            <AdminField
              id="venueNameEn"
              label="Name"
              name="venueNameEn"
              defaultValue={settings.venueNameEn}
            />
            <AdminField
              id="venueAddressEn"
              label="Address"
              name="venueAddressEn"
              defaultValue={settings.venueAddressEn}
            />
          </fieldset>
        </div>
        <div className="mt-5">
          <AdminField
            id="mapUrl"
            label="Адрес към карта"
            name="mapUrl"
            type="url"
            defaultValue={settings.mapUrl}
          />
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm font-semibold">
          <input
            defaultChecked={settings.venuePublished}
            id="venuePublished"
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
            <AdminField
              key={name}
              id={name}
              label={label}
              name={name}
              type="url"
              defaultValue={value}
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
              <AdminTextarea
                id={`footerBlurb${locale}`}
                label="Кратък текст"
                name={`footerBlurb${locale}`}
                defaultValue={settings[`footerBlurb${locale}`]}
              />
              <AdminField
                id={`copyright${locale}`}
                label="Copyright"
                name={`copyright${locale}`}
                defaultValue={settings[`copyright${locale}`]}
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
        <AdminFormStatus
          id="general-form"
          error={state.error}
          success={state.success}
        />
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
