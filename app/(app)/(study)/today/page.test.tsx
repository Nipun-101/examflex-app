import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TodayPage from "@/app/(app)/(study)/today/page";

vi.mock("@/lib/api/users", () => ({
  getMyProfile: vi.fn(),
}));

vi.mock("@/lib/equation-book/list-show-in-app-exams", () => ({
  listShowInAppExams: vi.fn(),
}));

vi.mock("@/lib/api/today", () => ({
  getToday: vi.fn(),
}));

vi.mock("@/lib/profile/persist-target-exam", () => ({
  persistTargetExam: vi.fn(),
}));

vi.mock("@/components/study/study-loading-overlay", () => ({
  StudyLoadingOverlay: ({ open, label }: { open: boolean; label?: string }) =>
    open ? <div role="status">{label ?? "Loading"}</div> : null,
}));

import { getMyProfile } from "@/lib/api/users";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";

describe("TodayPage", () => {
  beforeEach(() => {
    vi.mocked(getMyProfile).mockResolvedValue({
      ok: true,
      data: { id: "u1" } as never,
    });
    vi.mocked(listShowInAppExams).mockResolvedValue([]);
  });

  it("renders the empty Today dashboard after boot", async () => {
    render(<TodayPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "One good step at a time." })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("link", { name: /Take your first mock/i })
    ).toBeInTheDocument();
  });
});
