"use client";

import { useActionState, useRef, useState } from "react";
import { findScheduleOverlaps } from "@/lib/admin-validation";
import {
  deleteScheduleEntityAction,
  moveItemSpeakerAction,
  moveScheduleEntityAction,
  saveDayAction,
  saveItemAction,
  savePanelAction,
  saveSpeakerAction,
  type ScheduleFormState,
} from "./actions";

const fieldClass =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm";
const itemTypes = [
  "registration",
  "opening",
  "talk",
  "roundtable",
  "panel",
  "discussion",
  "break",
  "lunch",
  "visit",
  "closing",
];
const statuses = ["confirmed", "to_be_confirmed", "cancelled"];

type Day = {
  id: string;
  date: string;
  titleBg: string;
  titleEn: string;
  subtitleBg: string | null;
  subtitleEn: string | null;
  visible: boolean;
};
type Panel = {
  id: string;
  dayId: string;
  startTime: string;
  endTime: string;
  titleBg: string;
  titleEn: string;
  descriptionBg: string | null;
  descriptionEn: string | null;
  visible: boolean;
};
type Speaker = {
  id: string;
  nameBg: string;
  nameEn: string;
  affiliationBg: string | null;
  affiliationEn: string | null;
  status: string;
};
type Item = {
  id: string;
  dayId: string;
  panelId: string | null;
  startTime: string | null;
  endTime: string | null;
  itemType: string;
  status: string;
  titleBg: string;
  titleEn: string;
  descriptionBg: string | null;
  descriptionEn: string | null;
  visible: boolean;
  speakers: Array<{ speaker: Speaker }>;
};

function useFormPreview() {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  function showPreview() {
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
  return { formRef, preview, showPreview };
}

function Messages({ id, state }: { id: string; state: ScheduleFormState }) {
  return (
    <>
      {state.error ? (
        <p className="text-sm text-red-700" id={`${id}-error`} role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="text-sm text-green-800"
          id={`${id}-success`}
          role="status"
        >
          {state.success}
        </p>
      ) : null}
      {state.warnings?.map((warning) => (
        <p className="text-xs text-amber-900" key={warning}>
          {warning}
        </p>
      ))}
    </>
  );
}

function Preview({ values }: { values: Record<string, string> | null }) {
  if (!values) return null;
  const bg = values.titleBg || values.nameBg;
  const en = values.titleEn || values.nameEn;
  return (
    <div aria-live="polite" className="rounded-lg bg-neutral-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div lang="bg">
          <b>BG: {bg || "—"}</b>
          <p className="text-sm">
            {values.descriptionBg || values.subtitleBg || values.affiliationBg}
          </p>
        </div>
        <div lang="en">
          <b>EN: {en || "—"}</b>
          <p className="text-sm">
            {values.descriptionEn || values.subtitleEn || values.affiliationEn}
          </p>
        </div>
      </div>
      {!bg || !en ? (
        <p className="mt-3 text-xs font-semibold text-amber-800">
          Предупреждение: липсва {!bg ? "български" : "английски"} текст.
        </p>
      ) : null}
    </div>
  );
}

function SaveBar({
  id,
  pending,
  state,
  onPreview,
}: {
  id: string;
  pending: boolean;
  state: ScheduleFormState;
  onPreview: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        className="rounded border border-conference-green px-3 py-2 text-sm font-semibold text-conference-green"
        onClick={onPreview}
        type="button"
      >
        BG/EN преглед
      </button>
      <button
        className="rounded bg-conference-green px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Запазване…" : "Запази и публикувай"}
      </button>
      <Messages id={id} state={state} />
    </div>
  );
}

export function OrderControls({
  entity,
  id,
  first,
  last,
}: {
  entity: "day" | "panel" | "item";
  id: string;
  first: boolean;
  last: boolean;
}) {
  return (
    <div className="flex gap-3">
      {(["up", "down"] as const).map((direction) => (
        <form action={moveScheduleEntityAction} key={direction}>
          <input name="entity" type="hidden" value={entity} />
          <input name="id" type="hidden" value={id} />
          <input name="direction" type="hidden" value={direction} />
          <button
            className="text-xs underline disabled:text-neutral-400"
            disabled={direction === "up" ? first : last}
          >
            {direction === "up" ? "Нагоре" : "Надолу"}
          </button>
        </form>
      ))}
    </div>
  );
}

export function DeleteControl({
  entity,
  id,
}: {
  entity: "day" | "panel" | "item" | "speaker";
  id: string;
}) {
  const [state, action, pending] = useActionState(
    deleteScheduleEntityAction,
    {} as ScheduleFormState,
  );
  return (
    <form
      action={action}
      aria-describedby={
        state.error ? `delete-${entity}-${id}-error` : undefined
      }
      className="flex flex-wrap items-center gap-2"
    >
      <input name="entity" type="hidden" value={entity} />
      <input name="id" type="hidden" value={id} />
      <label className="text-xs" htmlFor={`delete-${entity}-${id}`}>
        Потвърждение
      </label>
      <input
        aria-describedby={
          state.error ? `delete-${entity}-${id}-error` : undefined
        }
        aria-invalid={state.error ? true : undefined}
        className="w-24 rounded border px-2 py-1 text-xs"
        id={`delete-${entity}-${id}`}
        name="confirmation"
        placeholder="DELETE"
        required
      />
      <button
        className="text-xs font-semibold text-red-700 underline"
        disabled={pending}
      >
        Изтрий
      </button>
      <Messages id={`delete-${entity}-${id}`} state={state} />
    </form>
  );
}

export function DayForm({ day }: { day?: Day }) {
  const [state, action, pending] = useActionState(
    saveDayAction,
    {} as ScheduleFormState,
  );
  const { formRef, preview, showPreview } = useFormPreview();
  return (
    <form
      action={action}
      aria-describedby={state.error ? "day-form-error" : undefined}
      className="space-y-4"
      ref={formRef}
    >
      <input name="id" type="hidden" value={day?.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold">
          Дата
          <input
            className={fieldClass}
            defaultValue={day?.date}
            name="date"
            required
            type="date"
          />
        </label>
        <label className="text-sm font-semibold">
          Заглавие BG
          <input
            className={fieldClass}
            defaultValue={day?.titleBg}
            name="titleBg"
          />
        </label>
        <label className="text-sm font-semibold">
          Title EN
          <input
            className={fieldClass}
            defaultValue={day?.titleEn}
            name="titleEn"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Подзаглавие BG
          <textarea
            className={fieldClass}
            defaultValue={day?.subtitleBg ?? ""}
            name="subtitleBg"
          />
        </label>
        <label className="text-sm font-semibold">
          Subtitle EN
          <textarea
            className={fieldClass}
            defaultValue={day?.subtitleEn ?? ""}
            name="subtitleEn"
          />
        </label>
      </div>
      <label className="flex gap-2 text-sm font-semibold">
        <input
          defaultChecked={day?.visible ?? true}
          name="visible"
          type="checkbox"
        />
        Видим
      </label>
      <Preview values={preview} />
      <SaveBar
        id="day-form"
        pending={pending}
        state={state}
        onPreview={showPreview}
      />
    </form>
  );
}

export function PanelForm({
  panel,
  days,
}: {
  panel?: Panel & { dayId: string };
  days: Day[];
}) {
  const [state, action, pending] = useActionState(
    savePanelAction,
    {} as ScheduleFormState,
  );
  const { formRef, preview, showPreview } = useFormPreview();
  return (
    <form
      action={action}
      aria-describedby={state.error ? "panel-form-error" : undefined}
      className="space-y-4"
      ref={formRef}
    >
      <input name="id" type="hidden" value={panel?.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold">
          Ден
          <select
            className={fieldClass}
            defaultValue={panel?.dayId ?? days[0]?.id}
            name="dayId"
          >
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {day.date} — {day.titleBg}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Начало
          <input
            className={fieldClass}
            defaultValue={panel?.startTime?.slice(0, 5)}
            name="startTime"
            required
            type="time"
          />
        </label>
        <label className="text-sm font-semibold">
          Край
          <input
            className={fieldClass}
            defaultValue={panel?.endTime?.slice(0, 5)}
            name="endTime"
            required
            type="time"
          />
        </label>
      </div>
      <BilingualFields value={panel} />
      <label className="flex gap-2 text-sm font-semibold">
        <input
          defaultChecked={panel?.visible ?? true}
          name="visible"
          type="checkbox"
        />
        Видим
      </label>
      <Preview values={preview} />
      <SaveBar
        id="panel-form"
        pending={pending}
        state={state}
        onPreview={showPreview}
      />
    </form>
  );
}

function BilingualFields({
  value,
}: {
  value?: {
    titleBg: string;
    titleEn: string;
    descriptionBg: string | null;
    descriptionEn: string | null;
  };
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {(["Bg", "En"] as const).map((locale) => (
        <fieldset className="space-y-3" key={locale}>
          <legend className="font-bold">
            {locale === "Bg" ? "Български" : "English"}
          </legend>
          <label className="block text-sm font-semibold">
            Заглавие
            <input
              className={fieldClass}
              defaultValue={value?.[`title${locale}`] ?? ""}
              name={`title${locale}`}
            />
          </label>
          <label className="block text-sm font-semibold">
            Описание
            <textarea
              className={`${fieldClass} min-h-24`}
              defaultValue={value?.[`description${locale}`] ?? ""}
              name={`description${locale}`}
            />
          </label>
        </fieldset>
      ))}
    </div>
  );
}

export function ItemForm({
  item,
  days,
  panels,
  speakers,
  items,
  defaultDayId,
  defaultPanelId,
}: {
  item?: Item;
  days: Day[];
  panels: Panel[];
  speakers: Speaker[];
  items: Item[];
  defaultDayId?: string;
  defaultPanelId?: string | null;
}) {
  const [state, action, pending] = useActionState(
    saveItemAction,
    {} as ScheduleFormState,
  );
  const { formRef, preview, showPreview } = useFormPreview();
  const selectedIds = item?.speakers.map(({ speaker }) => speaker.id) ?? [];
  const orderedSpeakers = [
    ...selectedIds
      .map((id) => speakers.find((speaker) => speaker.id === id))
      .filter((speaker): speaker is Speaker => Boolean(speaker)),
    ...speakers.filter((speaker) => !selectedIds.includes(speaker.id)),
  ];
  const previewWarnings = preview
    ? findScheduleOverlaps([
        ...items
          .filter((record) => record.id !== item?.id)
          .map((record) => ({
            ...record,
            title: record.titleBg || record.titleEn,
          })),
        {
          id: item?.id ?? "preview",
          title: preview.titleBg || preview.titleEn || "Нова сесия",
          dayId:
            preview.dayId ?? item?.dayId ?? defaultDayId ?? days[0]?.id ?? "",
          panelId: preview.panelId || null,
          startTime: preview.startTime || null,
          endTime: preview.endTime || null,
        },
      ])
    : [];
  return (
    <form
      action={action}
      aria-describedby={state.error ? "item-form-error" : undefined}
      className="space-y-4"
      ref={formRef}
    >
      <input name="id" type="hidden" value={item?.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold">
          Ден
          <select
            className={fieldClass}
            defaultValue={item?.dayId ?? defaultDayId ?? days[0]?.id}
            name="dayId"
          >
            {days.map((day) => (
              <option key={day.id} value={day.id}>
                {day.date}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Панел
          <select
            className={fieldClass}
            defaultValue={item?.panelId ?? defaultPanelId ?? ""}
            name="panelId"
          >
            <option value="">Без панел</option>
            {panels.map((panel) => (
              <option key={panel.id} value={panel.id}>
                {panel.titleBg} ({panel.dayId})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Начало
          <input
            className={fieldClass}
            defaultValue={item?.startTime?.slice(0, 5)}
            name="startTime"
            type="time"
          />
        </label>
        <label className="text-sm font-semibold">
          Край
          <input
            className={fieldClass}
            defaultValue={item?.endTime?.slice(0, 5)}
            name="endTime"
            type="time"
          />
        </label>
        <label className="text-sm font-semibold">
          Тип
          <select
            className={fieldClass}
            defaultValue={item?.itemType ?? "talk"}
            name="itemType"
          >
            {itemTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Статус
          <select
            className={fieldClass}
            defaultValue={item?.status ?? "confirmed"}
            name="status"
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <BilingualFields value={item} />
      <label className="block text-sm font-semibold">
        Говорители (Ctrl/Cmd за няколко)
        <select
          className={`${fieldClass} min-h-36`}
          defaultValue={selectedIds}
          multiple
          name="speakerIds"
        >
          {orderedSpeakers.map((speaker) => (
            <option key={speaker.id} value={speaker.id}>
              {speaker.nameBg || speaker.nameEn}
            </option>
          ))}
        </select>
      </label>
      {item && item.speakers.length > 1 ? (
        <div className="space-y-1 rounded-lg bg-neutral-50 p-3">
          <p className="text-xs font-bold">Ред на говорителите</p>
          {item.speakers.map(({ speaker }, index) => (
            <div className="flex items-center gap-3 text-xs" key={speaker.id}>
              <span className="mr-auto">
                {speaker.nameBg || speaker.nameEn}
              </span>
              {(["up", "down"] as const).map((direction) => (
                <button
                  className="underline disabled:text-neutral-400"
                  disabled={
                    direction === "up"
                      ? index === 0
                      : index === item.speakers.length - 1
                  }
                  formAction={moveItemSpeakerAction}
                  key={direction}
                  name="speakerCommand"
                  value={`${speaker.id}:${direction}`}
                >
                  {direction === "up" ? "Нагоре" : "Надолу"}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      <label className="flex gap-2 text-sm font-semibold">
        <input
          defaultChecked={item?.visible ?? true}
          name="visible"
          type="checkbox"
        />
        Видима
      </label>
      <Preview values={preview} />
      {previewWarnings.length ? (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          {previewWarnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
      <SaveBar
        id="item-form"
        pending={pending}
        state={state}
        onPreview={showPreview}
      />
    </form>
  );
}

export function SpeakerForm({ speaker }: { speaker?: Speaker }) {
  const [state, action, pending] = useActionState(
    saveSpeakerAction,
    {} as ScheduleFormState,
  );
  const { formRef, preview, showPreview } = useFormPreview();
  return (
    <form
      action={action}
      aria-describedby={state.error ? "speaker-form-error" : undefined}
      className="space-y-4"
      ref={formRef}
    >
      <input name="id" type="hidden" value={speaker?.id ?? ""} />
      <div className="grid gap-4 lg:grid-cols-2">
        {(["Bg", "En"] as const).map((locale) => (
          <fieldset className="space-y-3" key={locale}>
            <legend className="font-bold">
              {locale === "Bg" ? "Български" : "English"}
            </legend>
            <label className="block text-sm font-semibold">
              Име
              <input
                className={fieldClass}
                defaultValue={speaker?.[`name${locale}`] ?? ""}
                name={`name${locale}`}
              />
            </label>
            <label className="block text-sm font-semibold">
              Организация / роля
              <input
                className={fieldClass}
                defaultValue={speaker?.[`affiliation${locale}`] ?? ""}
                name={`affiliation${locale}`}
              />
            </label>
          </fieldset>
        ))}
      </div>
      <label className="text-sm font-semibold">
        Статус
        <select
          className={fieldClass}
          defaultValue={speaker?.status ?? "confirmed"}
          name="status"
        >
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </label>
      <Preview values={preview} />
      <SaveBar
        id="speaker-form"
        pending={pending}
        state={state}
        onPreview={showPreview}
      />
    </form>
  );
}
