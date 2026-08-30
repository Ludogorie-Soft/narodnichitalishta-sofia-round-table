import type { ReactNode } from "react";

const fieldClass =
  "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-conference-green focus:outline-none focus:ring-2 focus:ring-conference-green/20";

function describedBy(id: string, hint?: string, error?: string) {
  return (
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

export function AdminField({
  id,
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  error,
  hint,
  maxLength,
  autoComplete,
  disabled = false,
  describedById,
  minLength,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  disabled?: boolean;
  describedById?: string;
}) {
  const errorMessageId = describedById ?? (error ? `${id}-error` : undefined);
  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={
          [hint ? `${id}-hint` : null, errorMessageId]
            .filter(Boolean)
            .join(" ") || undefined
        }
        aria-invalid={error ? true : undefined}
        autoComplete={autoComplete}
        className={fieldClass}
        defaultValue={defaultValue ?? ""}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        required={required}
        type={type}
      />
      {hint ? (
        <p className="mt-1 text-xs text-muted" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error && !describedById ? (
        <p
          className="mt-1 text-sm text-red-700"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminTextarea({
  id,
  label,
  name,
  defaultValue,
  required = false,
  error,
  hint,
  maxLength,
  minHeightClassName = "min-h-28",
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  error?: string;
  hint?: string;
  maxLength?: number;
  minHeightClassName?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <textarea
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={`${fieldClass} resize-y leading-relaxed ${minHeightClassName}`}
        defaultValue={defaultValue ?? ""}
        id={id}
        maxLength={maxLength}
        name={name}
        required={required}
      />
      {hint ? (
        <p className="mt-1 text-xs text-muted" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          className="mt-1 text-sm text-red-700"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminSelect({
  id,
  label,
  name,
  defaultValue,
  children,
  required = false,
  error,
  multiple = false,
}: {
  id: string;
  label: string;
  name: string;
  defaultValue?: string | string[];
  required?: boolean;
  error?: string;
  multiple?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <select
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        className={multiple ? `${fieldClass} min-h-36` : fieldClass}
        defaultValue={defaultValue}
        id={id}
        multiple={multiple}
        name={name}
        required={required}
      >
        {children}
      </select>
      {error ? (
        <p
          className="mt-1 text-sm text-red-700"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function AdminFormStatus({
  id,
  error,
  success,
}: {
  id: string;
  error?: string;
  success?: string;
}) {
  return (
    <>
      {error ? (
        <p className="text-sm text-red-700" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          className="text-sm text-green-800"
          id={`${id}-success`}
          role="status"
        >
          {success}
        </p>
      ) : null}
    </>
  );
}
