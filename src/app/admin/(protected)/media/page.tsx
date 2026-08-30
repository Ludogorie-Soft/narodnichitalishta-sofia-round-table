import Image from "next/image";
import { DeleteMediaForm, MediaUploadForm } from "./media-forms";
import { listMediaAssets } from "@/lib/media";
import { requireAdminSession } from "@/lib/session";

export default async function MediaPage() {
  await requireAdminSession();
  const assets = await listMediaAssets();

  return (
    <main className="flex flex-col gap-8" id="main-content" tabIndex={-1}>
      <div>
        <h1 className="text-2xl font-semibold">Изображения</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Public conference images stored in Vercel Blob. Meaningful images
          require alt text in both languages.
        </p>
      </div>

      <section aria-labelledby="upload-heading">
        <h2 className="mb-3 text-lg font-semibold" id="upload-heading">
          Upload image
        </h2>
        <MediaUploadForm />
      </section>

      <section aria-labelledby="library-heading">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold" id="library-heading">
            Library
          </h2>
          <p className="text-sm text-neutral-600">{assets.length} images</p>
        </div>

        {assets.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-neutral-600">
            No Blob images have been uploaded yet.
          </p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {assets.map((asset) => (
              <li
                className="overflow-hidden rounded-lg border border-neutral-200"
                key={asset.id}
              >
                <div className="relative aspect-video bg-neutral-100">
                  <Image
                    alt={asset.altEn ?? ""}
                    className="object-contain"
                    fill
                    sizes="(min-width: 768px) 480px, 100vw"
                    src={asset.blobUrl}
                  />
                </div>
                <div className="p-4">
                  <p className="break-all text-xs text-neutral-500">
                    {asset.blobPathname}
                  </p>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div>
                      <dt className="font-medium">Dimensions</dt>
                      <dd>
                        {asset.width ?? "?"} × {asset.height ?? "?"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium">Bulgarian alt</dt>
                      <dd>{asset.altBg || "Decorative"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">English alt</dt>
                      <dd>{asset.altEn || "Decorative"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Usage</dt>
                      <dd>
                        {asset.usageCount === 0
                          ? "Unused"
                          : `${asset.usageCount} partner reference(s)`}
                      </dd>
                    </div>
                  </dl>
                  <DeleteMediaForm
                    id={asset.id}
                    disabled={asset.usageCount > 0}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
