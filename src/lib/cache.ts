import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_SITE_CACHE_TAG = "public-site";

export function revalidatePublicSite() {
  revalidateTag(PUBLIC_SITE_CACHE_TAG, { expire: 0 });
  revalidatePath("/");
  revalidatePath("/en");
}
