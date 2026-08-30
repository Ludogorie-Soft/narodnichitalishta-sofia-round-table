import type { ReactNode } from "react";
import Image from "next/image";
import type { ScheduleItemStatus } from "@/lib/datetime";
import type { Locale } from "@/lib/i18n";

export function SectionHeading({
  eyebrow,
  children,
}: {
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="mb-3 text-sm font-bold tracking-[0.16em] text-conference-green uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl leading-tight font-semibold text-conference-green text-balance sm:text-4xl">
        {children}
      </h2>
      <div
        aria-hidden="true"
        className="mt-5 h-1 w-16 rounded-full bg-conference-pink"
      />
    </div>
  );
}

const statusLabels = {
  bg: {
    confirmed: "Потвърдено",
    to_be_confirmed: "За потвърждение",
    cancelled: "Отменено",
  },
  en: {
    confirmed: "Confirmed",
    to_be_confirmed: "To be confirmed",
    cancelled: "Cancelled",
  },
} satisfies Record<Locale, Record<ScheduleItemStatus, string>>;

const statusStyles: Record<ScheduleItemStatus, string> = {
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-700/20",
  to_be_confirmed: "bg-amber-50 text-amber-900 ring-amber-700/25",
  cancelled: "bg-red-50 text-red-800 ring-red-700/20",
};

export function StatusBadge({
  locale,
  status,
}: {
  locale: Locale;
  status: ScheduleItemStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {statusLabels[locale][status]}
    </span>
  );
}

export function Callout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <aside className="rounded-2xl border-l-4 border-conference-pink bg-conference-green-soft p-6 sm:p-8">
      {title ? (
        <h3 className="font-display text-xl font-semibold text-conference-green">
          {title}
        </h3>
      ) : null}
      <div className={title ? "mt-3 leading-relaxed" : "leading-relaxed"}>
        {children}
      </div>
    </aside>
  );
}

export function PartnerLogo({
  alt,
  height,
  src,
  width,
}: {
  alt: string;
  height: number;
  src: string;
  width: number;
}) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-neutral-200 bg-white p-5">
      <Image
        alt={alt}
        className="max-h-20 w-auto max-w-full object-contain"
        height={height}
        sizes="(min-width: 768px) 220px, 45vw"
        src={src}
        width={width}
      />
    </div>
  );
}
