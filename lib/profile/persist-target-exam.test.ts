import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/users", () => ({
  updateMyProfile: vi.fn(),
}));

import { updateMyProfile } from "@/lib/api/users";
import { persistTargetExam } from "@/lib/profile/persist-target-exam";

describe("persistTargetExam", () => {
  beforeEach(() => {
    vi.mocked(updateMyProfile).mockReset();
  });

  it("patches the profile primary target exam", async () => {
    vi.mocked(updateMyProfile).mockResolvedValue({
      ok: true,
      data: {
        id: "u1",
        name: "Ada",
        email: "a@b.c",
        role: "student",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        targetExam: { id: "e1", name: "NEET" },
      },
    });

    const result = await persistTargetExam("e1");
    expect(updateMyProfile).toHaveBeenCalledWith({ targetExam: "e1" });
    expect(result.ok).toBe(true);
  });
});
