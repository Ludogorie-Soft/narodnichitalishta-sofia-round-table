import { describe, expect, it } from "vitest";
import { assertCanDisableAccount, normalizeEmail } from "@/lib/permissions";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  e.kadiyski@Gmail.com ")).toBe(
      "e.kadiyski@gmail.com",
    );
  });
});

describe("assertCanDisableAccount", () => {
  it("blocks disabling the last active administrator", () => {
    expect(() =>
      assertCanDisableAccount({
        targetUserId: "1",
        actorUserId: "2",
        targetIsActive: true,
        activeCount: 1,
        confirmedSelfDisable: false,
      }),
    ).toThrow(/последният активен администратор/);
  });

  it("requires confirmation before self-disable", () => {
    expect(() =>
      assertCanDisableAccount({
        targetUserId: "1",
        actorUserId: "1",
        targetIsActive: true,
        activeCount: 2,
        confirmedSelfDisable: false,
      }),
    ).toThrow(/Потвърдете/);
  });

  it("allows disabling another account when more than one is active", () => {
    expect(() =>
      assertCanDisableAccount({
        targetUserId: "1",
        actorUserId: "2",
        targetIsActive: true,
        activeCount: 2,
        confirmedSelfDisable: false,
      }),
    ).not.toThrow();
  });
});
