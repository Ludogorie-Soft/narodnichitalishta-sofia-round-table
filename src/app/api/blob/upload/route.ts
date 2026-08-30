import { del, put } from "@vercel/blob";
import { getAdminSession } from "@/lib/session";
import { createMediaAsset } from "@/lib/media";
import { safeMediaPathname, validateMediaUpload } from "@/lib/media-validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session?.user || session.user.active === false) {
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
        error:
          error instanceof Error ? error.message : "The image is not valid.",
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
  } catch {
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
  } catch {
    await del(blob.pathname).catch(() => undefined);
    return Response.json(
      { error: "The upload was not saved. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ id }, { status: 201 });
}
