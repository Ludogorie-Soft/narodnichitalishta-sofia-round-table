import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { z } from "zod";
import {
  MAX_MEDIA_FILE_SIZE,
  MAX_MEDIA_FILE_SIZE_LABEL,
} from "@/lib/media-constants";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

const metadataSchema = z
  .object({
    altBg: z.string().trim().max(300),
    altEn: z.string().trim().max(300),
    decorative: z.boolean(),
  })
  .superRefine((value, context) => {
    if (!value.decorative && (!value.altBg || !value.altEn)) {
      context.addIssue({
        code: "custom",
        message:
          "Bulgarian and English alt text are required for meaningful images.",
      });
    }
  });

export type ValidatedMediaUpload = {
  bytes: Uint8Array;
  extension: string;
  mimeType: string;
  width: number;
  height: number;
  altBg: string | null;
  altEn: string | null;
};

export async function validateMediaUpload(input: {
  file: File;
  altBg: unknown;
  altEn: unknown;
  decorative: unknown;
}): Promise<ValidatedMediaUpload> {
  if (input.file.size === 0) {
    throw new Error("Choose a non-empty image file.");
  }

  if (input.file.size > MAX_MEDIA_FILE_SIZE) {
    throw new Error(
      `The image must be no larger than ${MAX_MEDIA_FILE_SIZE_LABEL}.`,
    );
  }

  const metadata = metadataSchema.parse({
    altBg: input.altBg,
    altEn: input.altEn,
    decorative: input.decorative === "true" || input.decorative === true,
  });
  const bytes = new Uint8Array(await input.file.arrayBuffer());
  const detected = await fileTypeFromBuffer(bytes);
  const extension = detected ? allowedTypes.get(detected.mime) : undefined;

  if (!detected || !extension) {
    throw new Error("Only JPEG, PNG, WebP, and AVIF images are accepted.");
  }

  let dimensions: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    dimensions = await sharp(bytes, {
      failOn: "warning",
      limitInputPixels: 40_000_000,
    }).metadata();
  } catch {
    throw new Error("The uploaded image is invalid or corrupted.");
  }

  if (!dimensions.width || !dimensions.height) {
    throw new Error("The image dimensions could not be determined.");
  }

  return {
    bytes,
    extension,
    mimeType: detected.mime,
    width: dimensions.width,
    height: dimensions.height,
    altBg: metadata.decorative ? null : metadata.altBg,
    altEn: metadata.decorative ? null : metadata.altEn,
  };
}

export function safeMediaPathname(fileName: string, extension: string): string {
  const baseName =
    fileName
      .replace(/\.[^.]+$/, "")
      .normalize("NFKD")
      .replace(/[^\w-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80) || "image";

  return `conference/${baseName}.${extension}`;
}
