"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteMediaAsset } from "@/lib/media";
import { requireAdminSession } from "@/lib/session";

const deleteSchema = z.object({
  id: z.string().uuid(),
  confirmation: z.literal("DELETE"),
});

export type DeleteMediaResult = {
  error?: string;
  success?: string;
};

export async function deleteMediaAssetAction(
  _previous: DeleteMediaResult,
  formData: FormData,
): Promise<DeleteMediaResult> {
  const session = await requireAdminSession();
  const parsed = deleteSchema.safeParse({
    id: formData.get("id"),
    confirmation: formData.get("confirmation"),
  });

  if (!parsed.success) {
    return { error: "Type DELETE to confirm permanent deletion." };
  }

  try {
    const result = await deleteMediaAsset({
      id: parsed.data.id,
      actorUserId: session.user.id,
    });
    revalidatePath("/admin/media");

    return {
      success: result.blobDeleted
        ? "The image was deleted."
        : "The record was deleted, but Blob cleanup requires attention.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Deletion failed.",
    };
  }
}
