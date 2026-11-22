import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TodayPageClient } from "@/components/study/today-page-client";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

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
  persistTargetExam: vi.fn().mockResolvedValue({ ok: true, data: {} }),
}));

vi.mock("@/components/study/study-route-loading", () => ({
  StudyRouteLoading: ({ busy }: { busy: boolean }) =>
    busy ? <div role="status">Loading your study space...</div> : null,
  StudyRouteLoadingFallback: () => (
    <div role="status">Loading your study space...</div>
  ),
}));

import { getToday } from "@/lib/api/today";
import { getMyProfile } from "@/lib/api/users";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";

describe("TodayPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads live today payload when target exam is set", async () => {
    vi.mocked(getMyProfile).mockResolvedValue({
      ok: true,
      data: {
        id: "u1",
        targetExam: { id: "exam-neet", name: "NEET UG" },
      } as never,
    });
    vi.mocked(listShowInAppExams).mockResolvedValue([
      { id: "exam-neet", name: "NEET UG" },
    ]);
    vi.mocked(getToday).mockResolvedValue({
      ok: true,
      data: {
        ...TODAY_PAGE_DATA,
        examId: "exam-neet",
        footerRight: "Based on your full mocks · No admission prediction",
      },
    });

    render(<TodayPageClient />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Your mistakes have a next chapter.",
        }),
      ).toBeInTheDocument();
    });
    expect(getToday).toHaveBeenCalledWith("exam-neet");
    expect(screen.queryByText(/illustrative data/i)).not.toBeInTheDocument();
  });

  it("shows empty seed when no exams are available", async () => {
    vi.mocked(getMyProfile).mockResolvedValue({
      ok: true,
      data: { id: "u1" } as never,
    });
    vi.mocked(listShowInAppExams).mockResolvedValue([]);

    render(<TodayPageClient />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Your first step is a quick revision.",
        }),
      ).toBeInTheDocument();
    });
    expect(getToday).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Unlocks with your first score/i),
    ).toBeInTheDocument();
  });

  it("shows soft error banner with empty seed on API failure", async () => {
    vi.mocked(getMyProfile).mockResolvedValue({
      ok: true,
      data: {
        id: "u1",
        targetExam: { id: "exam-neet", name: "NEET UG" },
      } as never,
    });
    vi.mocked(listShowInAppExams).mockResolvedValue([
      { id: "exam-neet", name: "NEET UG" },
    ]);
    vi.mocked(getToday).mockResolvedValue({
      ok: false,
      message: "Could not load your Today dashboard.",
      status: 500,
    });

    render(<TodayPageClient />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /Could not load your Today dashboard/i,
      );
    });
    expect(TODAY_EMPTY_SEED.mode).toBe("empty");
    expect(
      screen.getByRole("heading", {
        name: "Your first step is a quick revision.",
      }),
    ).toBeInTheDocument();
  });
});
