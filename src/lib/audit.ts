import { getDb } from "@/db";
import { auditLog } from "@/db/schema";

export async function recordAudit(input: {
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
}) {
  await getDb()
    .insert(auditLog)
    .values({
      id: crypto.randomUUID(),
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
    });
}
