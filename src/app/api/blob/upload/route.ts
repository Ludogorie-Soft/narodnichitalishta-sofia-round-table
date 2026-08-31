import { del, put } from "@vercel/blob";
import { createMediaAsset } from "@/lib/media";
import { safeMediaPathname, validateMediaUpload } from "@/lib/media-validation";
import {
  AuthorizationError,
  OriginError,
  RateLimitError,
  logServerError,
  publicErrorMessage,
} from "@/lib/security";
import { requireAdminApi } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let session: Awaited<ReturnType<typeof requireAdminApi>>;
  try {
    session = await requireAdminApi();
  } catch (error) {
    if (error instanceof OriginError) {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }
    if (error instanceof RateLimitError) {
      return Response.json({ error: "Too many requests." }, { status: 429 });
    }
    if (!(error instanceof AuthorizationError)) {
      logServerError(error, "blob-upload-auth");
    }
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image file." }, { status: 400 });
  }

  let validated: Awaited<ReturnType<typeof validateMediaUpload>>;
  try {
    validated = await validateMediaUpload({
      file,
      altBg: formData.get("altBg"),
      altEn: formData.get("altEn"),
      decorative: formData.get("decorative"),
    });
  } catch (error) {
    return Response.json(
      {
        error: publicErrorMessage(error, "The image is not valid."),
      },
      { status: 400 },
    );
  }

  let blob: Awaited<ReturnType<typeof put>>;
  try {
    blob = await put(
      safeMediaPathname(file.name, validated.extension),
      Buffer.from(validated.bytes),
      {
        access: "public",
        addRandomSuffix: true,
        contentType: validated.mimeType,
        cacheControlMaxAge: 60 * 60 * 24 * 30,
      },
    );
  } catch (error) {
    logServerError(error, "blob-upload");
    return Response.json(
      { error: "The image could not be uploaded to Blob storage." },
      { status: 502 },
    );
  }

  const id = crypto.randomUUID();
  try {
    await createMediaAsset({
      id,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      mimeType: validated.mimeType,
      width: validated.width,
      height: validated.height,
      altBg: validated.altBg,
      altEn: validated.altEn,
      actorUserId: session.user.id,
    });
  } catch (error) {
    logServerError(error, "blob-upload-save");
    await del(blob.pathname).catch(() => undefined);
    return Response.json(
      { error: "The upload was not saved. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ id }, { status: 201 });
}
