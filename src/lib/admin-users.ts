import { count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { createLocalAccountIssuer } from "@better-auth/core/db";
import { auth } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import {
  assertCanDisableAccount,
  MIN_ADMIN_PASSWORD_LENGTH,
  normalizeEmail,
} from "@/lib/permissions";

async function countActiveAdministrators() {
  const [row] = await getDb()
    .select({ value: count() })
    .from(user)
    .where(eq(user.active, true));
  return row?.value ?? 0;
}

export async function createAdministrator(input: {
  email: string;
  name: string;
  password: string;
  actorUserId?: string | null;
}) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const password = input.password;

  if (!email || !email.includes("@")) {
    throw new Error("Въведете валиден имейл адрес.");
  }
  if (!name) {
    throw new Error("Въведете име.");
  }
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `Паролата трябва да е поне ${MIN_ADMIN_PASSWORD_LENGTH} символа.`,
    );
  }

  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    throw new Error("Администратор с този имейл вече съществува.");
  }

  const created = await ctx.internalAdapter.createUser(
    {
      email,
      name,
      emailVerified: true,
      active: true,
    },
    { method: "admin" },
  );

  if (!created) {
    throw new Error("Неуспешно създаване на администратор.");
  }

  const hash = await ctx.password.hash(password);
  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: "credential",
    issuer: createLocalAccountIssuer("credential"),
    accountId: created.id,
    password: hash,
  });

  await recordAudit({
    actorUserId: input.actorUserId ?? null,
    action: "user.create",
    entityType: "user",
    entityId: created.id,
    summary: `Created administrator ${email}`,
  });

  return { id: created.id, email: created.email, name: created.name };
}

export async function setAdministratorActive(input: {
  targetUserId: string;
  actorUserId: string;
  actorEmail: string;
  active: boolean;
  confirmEmail?: string;
}) {
  const [target] = await getDb()
    .select()
    .from(user)
    .where(eq(user.id, input.targetUserId))
    .limit(1);

  if (!target) {
    throw new Error("Администраторът не е намерен.");
  }

  if (input.active) {
    await getDb()
      .update(user)
      .set({ active: true, updatedAt: new Date() })
      .where(eq(user.id, target.id));

    await recordAudit({
      actorUserId: input.actorUserId,
      action: "user.enable",
      entityType: "user",
      entityId: target.id,
      summary: `Enabled administrator ${target.email}`,
    });
    return;
  }

  const activeCount = await countActiveAdministrators();
  assertCanDisableAccount({
    targetUserId: target.id,
    actorUserId: input.actorUserId,
    targetIsActive: target.active,
    activeCount,
    confirmedSelfDisable:
      normalizeEmail(input.confirmEmail ?? "") ===
      normalizeEmail(input.actorEmail),
  });

  await getDb()
    .update(user)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(user.id, target.id));

  const ctx = await auth.$context;
  await ctx.internalAdapter.deleteUserSessions(target.id);

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "user.disable",
    entityType: "user",
    entityId: target.id,
    summary: `Disabled administrator ${target.email}`,
  });
}

export async function setTemporaryPassword(input: {
  targetUserId: string;
  actorUserId: string;
  password: string;
}) {
  if (input.password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `Паролата трябва да е поне ${MIN_ADMIN_PASSWORD_LENGTH} символа.`,
    );
  }

  const [target] = await getDb()
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.id, input.targetUserId))
    .limit(1);

  if (!target) {
    throw new Error("Администраторът не е намерен.");
  }

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(input.password);
  const account = await ctx.internalAdapter.findCredentialAccount(target.id);

  if (!account) {
    await ctx.internalAdapter.linkAccount({
      userId: target.id,
      providerId: "credential",
      issuer: createLocalAccountIssuer("credential"),
      accountId: target.id,
      password: hash,
    });
  } else {
    await ctx.internalAdapter.updateAccount(account.id, { password: hash });
  }

  await ctx.internalAdapter.deleteUserSessions(target.id);

  await recordAudit({
    actorUserId: input.actorUserId,
    action: "user.password.reset",
    entityType: "user",
    entityId: target.id,
    summary: `Set a temporary password for ${target.email}`,
  });
}

export async function listAdministrators() {
  return getDb()
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      active: user.active,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt);
}
