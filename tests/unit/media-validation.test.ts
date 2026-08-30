import { describe, expect, it } from "vitest";
import { safeMediaPathname, validateMediaUpload } from "@/lib/media-validation";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

describe("media upload validation", () => {
  it("accepts a signed PNG and reads its dimensions", async () => {
    const result = await validateMediaUpload({
      file: new File([onePixelPng], "logo.png", { type: "image/png" }),
      altBg: "Лого",
      altEn: "Logo",
      decorative: false,
    });

    expect(result).toMatchObject({
      extension: "png",
      mimeType: "image/png",
      width: 1,
      height: 1,
      altBg: "Лого",
      altEn: "Logo",
    });
  });

  it("rejects a file whose claimed MIME type does not match its bytes", async () => {
    const upload = validateMediaUpload({
      file: new File(["<svg></svg>"], "image.png", { type: "image/png" }),
      altBg: "Изображение",
      altEn: "Image",
      decorative: false,
    });

    await expect(upload).rejects.toThrow(
      "Only JPEG, PNG, WebP, and AVIF images are accepted.",
    );
  });

  it("requires both alt texts for meaningful images", async () => {
    const upload = validateMediaUpload({
      file: new File([onePixelPng], "logo.png", { type: "image/png" }),
      altBg: "Лого",
      altEn: "",
      decorative: false,
    });

    await expect(upload).rejects.toThrow();
  });

  it("stores empty alt text for decorative images", async () => {
    const result = await validateMediaUpload({
      file: new File([onePixelPng], "divider.png", { type: "image/png" }),
      altBg: "",
      altEn: "",
      decorative: true,
    });

    expect(result.altBg).toBeNull();
    expect(result.altEn).toBeNull();
  });
});

describe("safeMediaPathname", () => {
  it("removes unsafe filename characters and controls the extension", () => {
    expect(safeMediaPathname("../../My Logo.svg", "png")).toBe(
      "conference/my-logo.png",
    );
  });
});
