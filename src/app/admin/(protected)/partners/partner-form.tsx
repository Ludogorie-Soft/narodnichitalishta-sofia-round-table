"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { AdminField, AdminFormStatus } from "@/components/admin/form-controls";
import type { AdminMediaChoice } from "@/lib/admin-partners";
import { partnerBrandLogoByPartnerId } from "@/lib/partner-brand-logos";
import {
  deletePartnerAction,
  movePartnerAction,
  savePartnerAction,
  type PartnerFormState,
} from "./actions";

type Partner = {
  id: string;
  name: string;
  mediaId: string | null;
  url: string | null;
  visible: boolean;
};

function resolveSelectedMedia(
  mediaId: string | null | undefined,
  media: AdminMediaChoice[],
  partnerId?: string,
) {
  if (mediaId) {
    return media.find((image) => image.id === mediaId) ?? null;
  }
  if (partnerId) {
    const brandLogo = partnerBrandLogoByPartnerId(partnerId);
    if (brandLogo) {
      return {
        id: brandLogo.id,
        blobUrl: brandLogo.src,
        blobPathname: brandLogo.blobPathname,
        altBg: brandLogo.altBg,
        width: brandLogo.width,
        height: brandLogo.height,
        label: brandLogo.label,
      };
    }
  }
  return null;
}

export function PartnerForm({
  partner,
  media,
  first,
  last,
}: {
  partner?: Partner;
  media: AdminMediaChoice[];
  first?: boolean;
  last?: boolean;
}) {
  const [saveState, saveAction, savePending] = useActionState(
    savePartnerAction,
    {} as PartnerFormState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePartnerAction,
    {} as PartnerFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedMediaId, setSelectedMediaId] = useState(() => {
    if (partner?.mediaId) return partner.mediaId;
    if (partner?.id) {
      return partnerBrandLogoByPartnerId(partner.id)?.id ?? "";
    }
    return "";
  });
  const [preview, setPreview] = useState<{
    name: string;
    url: string;
    mediaId: string;
  } | null>(null);
  const activeMediaId = preview?.mediaId ?? selectedMediaId;
  const selectedMedia = resolveSelectedMedia(
    activeMediaId || partner?.mediaId,
    media,
    partner?.id,
  );
  const formId = partner?.id ?? "new-partner";

  function showPreview() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    setPreview({
      name: String(data.get("name") ?? ""),
      url: String(data.get("url") ?? ""),
      mediaId: String(data.get("mediaId") ?? ""),
    });
  }

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5">
      <form
        action={saveAction}
        aria-describedby={saveState.error ? `${formId}-error` : undefined}
        className="space-y-4"
        ref={formRef}
      >
        <input name="id" type="hidden" value={partner?.id ?? ""} />
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminField
            describedById={saveState.error ? `${formId}-error` : undefined}
            defaultValue={partner?.name ?? ""}
            error={saveState.error}
            id={`${formId}-name`}
            label="Име"
            maxLength={300}
            name="name"
            required
          />
          <AdminField
            describedById={saveState.error ? `${formId}-error` : undefined}
            defaultValue={partner?.url ?? ""}
            error={saveState.error}
            id={`${formId}-url`}
            label="Интернет адрес"
            name="url"
            type="url"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-semibold">Лого</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 has-checked:border-conference-green has-checked:ring-2 has-checked:ring-conference-green/20">
              <input
                checked={!selectedMediaId}
                className="accent-conference-green"
                name="mediaId"
                onChange={() => setSelectedMediaId("")}
                type="radio"
                value=""
              />
              <span className="text-sm">Без изображение</span>
            </label>
            {media.map((image) => (
              <label
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 has-checked:border-conference-green has-checked:ring-2 has-checked:ring-conference-green/20"
                key={image.id}
              >
                <input
                  checked={selectedMediaId === image.id}
                  className="accent-conference-green"
                  name="mediaId"
                  onChange={() => setSelectedMediaId(image.id)}
                  type="radio"
                  value={image.id}
                />
                <Image
                  alt={image.altBg ?? ""}
                  className="h-12 w-20 object-contain"
                  height={image.height ?? 48}
                  src={image.blobUrl}
                  width={image.width ?? 80}
                />
                <span className="min-w-0 text-sm leading-snug">
                  {image.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {selectedMedia ? (
          <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
            <Image
              alt={selectedMedia.altBg ?? ""}
              className="h-16 w-28 object-contain"
              height={selectedMedia.height ?? 64}
              src={selectedMedia.blobUrl}
              width={selectedMedia.width ?? 112}
            />
            <p className="text-sm text-neutral-600">
              Текущо лого:{" "}
              <span className="font-semibold">{selectedMedia.label}</span>
            </p>
          </div>
        ) : null}

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            defaultChecked={partner?.visible ?? true}
            name="visible"
            type="checkbox"
          />
          Видим на сайта
        </label>

        {preview ? (
          <div
            aria-live="polite"
            className="flex min-h-32 items-center gap-5 rounded-xl bg-neutral-50 p-4"
          >
            {selectedMedia ? (
              <Image
                alt={selectedMedia.altBg ?? ""}
                className="h-20 w-28 object-contain"
                height={selectedMedia.height ?? 80}
                src={selectedMedia.blobUrl}
                width={selectedMedia.width ?? 112}
              />
            ) : null}
            <div>
              <p className="font-semibold">{preview.name || "Без име"}</p>
              <p className="mt-1 break-all text-xs text-neutral-500">
                {preview.url || "Без връзка"}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-lg border border-conference-green px-3 py-2 text-sm font-semibold text-conference-green"
            onClick={showPreview}
            type="button"
          >
            Преглед
          </button>
          <button
            className="rounded-lg bg-conference-green px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            disabled={savePending}
            type="submit"
          >
            {savePending ? "Запазване…" : "Запази и публикувай"}
          </button>
          <AdminFormStatus
            id={formId}
            error={saveState.error}
            success={saveState.success}
          />
        </div>
      </form>

      {partner ? (
        <div className="mt-5 flex flex-wrap gap-3 border-t border-neutral-200 pt-4">
          <form action={movePartnerAction}>
            <input name="id" type="hidden" value={partner.id} />
            <input name="direction" type="hidden" value="up" />
            <button
              className="text-sm underline disabled:text-neutral-400"
              disabled={first}
              type="submit"
            >
              Премести нагоре
            </button>
          </form>
          <form action={movePartnerAction}>
            <input name="id" type="hidden" value={partner.id} />
            <input name="direction" type="hidden" value="down" />
            <button
              className="text-sm underline disabled:text-neutral-400"
              disabled={last}
              type="submit"
            >
              Премести надолу
            </button>
          </form>
          <form
            action={deleteAction}
            aria-describedby={
              deleteState.error ? `${formId}-delete-error` : undefined
            }
            className="ml-auto flex flex-wrap items-center gap-2"
          >
            <input name="id" type="hidden" value={partner.id} />
            <label className="text-xs" htmlFor={`${formId}-delete-confirm`}>
              Потвърждение
            </label>
            <input
              aria-describedby={
                deleteState.error ? `${formId}-delete-error` : undefined
              }
              aria-invalid={deleteState.error ? true : undefined}
              className="w-24 rounded border px-2 py-1"
              id={`${formId}-delete-confirm`}
              name="confirmation"
              placeholder="DELETE"
              required
            />
            <button
              className="text-sm font-semibold text-red-700 underline"
              disabled={deletePending}
              type="submit"
            >
              Изтрий
            </button>
            {deleteState.error ? (
              <p
                className="w-full text-xs text-red-700"
                id={`${formId}-delete-error`}
                role="alert"
              >
                {deleteState.error}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
    </article>
  );
}
