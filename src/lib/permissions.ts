export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const MIN_ADMIN_PASSWORD_LENGTH = 12;

export type DisableAccountInput = {
  targetUserId: string;
  actorUserId: string;
  targetIsActive: boolean;
  activeCount: number;
  confirmedSelfDisable: boolean;
};

export function assertCanDisableAccount(input: DisableAccountInput): void {
  if (!input.targetIsActive) {
    return;
  }

  if (input.activeCount <= 1) {
    throw new Error(
      "Не може да се деактивира последният активен администратор.",
    );
  }

  if (input.targetUserId === input.actorUserId && !input.confirmedSelfDisable) {
    throw new Error(
      "Потвърдете деактивирането на собствения си акаунт, като въведете имейла си.",
    );
  }
}
