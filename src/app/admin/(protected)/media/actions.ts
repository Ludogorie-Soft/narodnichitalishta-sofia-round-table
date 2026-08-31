"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteMediaAsset } from "@/lib/media";
import { mutationErrorResult } from "@/lib/security";
import { requireAdminMutation } from "@/lib/session";

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
  try {
    const session = await requireAdminMutation({ sensitive: true });
    const parsed = deleteSchema.safeParse({
      id: formData.get("id"),
      confirmation: formData.get("confirmation"),
    });

    if (!parsed.success) {
      return { error: "Type DELETE to confirm permanent deletion." };
    }

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
    return mutationErrorResult(error, "Deletion failed.");
  }
}
