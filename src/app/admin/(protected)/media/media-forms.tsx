"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMediaAssetAction, type DeleteMediaResult } from "./actions";
import { MAX_MEDIA_FILE_SIZE_LABEL } from "@/lib/media-constants";

type UploadState = {
  error?: string;
  success?: string;
};

export function MediaUploadForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [decorative, setDecorative] = useState(false);
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<UploadState>({});

  async function submit(formData: FormData) {
    setPending(true);
    setState({});

    try {
      const response = await fetch("/api/blob/upload", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setState({ error: result.error ?? "Upload failed." });
        return;
      }

      formRef.current?.reset();
      setDecorative(false);
      setState({ success: "The image was uploaded." });
      router.refresh();
    } catch {
      setState({
        error: "Upload failed. Check your connection and try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={submit}
      aria-describedby={state.error ? "media-upload-error" : undefined}
      className="grid gap-4 rounded-lg border border-neutral-200 p-5"
    >
      <div>
        <label className="block text-sm font-medium" htmlFor="media-file">
          Image
        </label>
        <input
          aria-describedby={[
            "media-file-hint",
            state.error ? "media-upload-error" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={state.error ? true : undefined}
          className="mt-1 block w-full text-sm"
          id="media-file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
        />
        <p className="mt-1 text-xs text-neutral-600" id="media-file-hint">
          JPEG, PNG, WebP, or AVIF. Maximum {MAX_MEDIA_FILE_SIZE_LABEL}.
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          className="mt-1"
          name="decorative"
          type="checkbox"
          value="true"
          checked={decorative}
          onChange={(event) => setDecorative(event.target.checked)}
        />
        This image is purely decorative and should have empty alt text
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium" htmlFor="media-alt-bg">
            Bulgarian alt text
          </label>
          <input
            aria-describedby={state.error ? "media-upload-error" : undefined}
            aria-invalid={state.error ? true : undefined}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 disabled:bg-neutral-100"
            id="media-alt-bg"
            name="altBg"
            maxLength={300}
            required={!decorative}
            disabled={decorative}
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="media-alt-en">
            English alt text
          </label>
          <input
            aria-describedby={state.error ? "media-upload-error" : undefined}
            aria-invalid={state.error ? true : undefined}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 disabled:bg-neutral-100"
            id="media-alt-en"
            name="altEn"
            maxLength={300}
            required={!decorative}
            disabled={decorative}
          />
        </div>
      </div>

      {state.error ? (
        <p
          className="text-sm text-red-700"
          id="media-upload-error"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-green-700" role="status">
          {state.success}
        </p>
      ) : null}

      <button
        className="w-fit rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Uploading…" : "Upload image"}
      </button>
    </form>
  );
}

const initialDeleteState: DeleteMediaResult = {};

export function DeleteMediaForm({
  id,
  disabled,
}: {
  id: string;
  disabled: boolean;
}) {
  const [state, action, pending] = useActionState(
    deleteMediaAssetAction,
    initialDeleteState,
  );

  return (
    <form
      action={action}
      aria-describedby={state.error ? `delete-media-${id}-error` : undefined}
      className="mt-4 grid gap-2 border-t pt-4"
    >
      <input type="hidden" name="id" value={id} />
      <label className="text-xs" htmlFor={`confirmation-${id}`}>
        Type DELETE to confirm
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          aria-describedby={
            [
              disabled ? `delete-media-${id}-hint` : null,
              state.error ? `delete-media-${id}-error` : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={state.error ? true : undefined}
          className="min-w-0 flex-1 rounded border border-neutral-300 px-2 py-1 text-sm"
          id={`confirmation-${id}`}
          name="confirmation"
          autoComplete="off"
          disabled={disabled || pending}
        />
        <button
          className="rounded border border-red-300 px-3 py-1 text-sm text-red-800 disabled:opacity-50"
          type="submit"
          disabled={disabled || pending}
        >
          {pending ? "Deleting…" : "Delete"}
        </button>
      </div>
      {disabled ? (
        <p className="text-xs text-neutral-600" id={`delete-media-${id}-hint`}>
          Remove all partner references before deletion.
        </p>
      ) : null}
      {state.error ? (
        <p
          className="text-xs text-red-700"
          id={`delete-media-${id}-error`}
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-green-700" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
