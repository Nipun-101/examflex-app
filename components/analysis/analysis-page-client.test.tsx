import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalysisPageClient } from "@/components/analysis/analysis-page-client";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";

vi.mock("@/lib/api/users", () => ({
  getMyProfile: vi.fn(),
}));

vi.mock("@/lib/equation-book/list-show-in-app-exams", () => ({
  listShowInAppExams: vi.fn(),
}));

vi.mock("@/lib/api/analysis", () => ({
  getAnalysisOverview: vi.fn(),
}));

vi.mock("@/lib/profile/persist-target-exam", () => ({
  persistTargetExam: vi.fn().mockResolvedValue({ ok: true, data: {} }),
}));

vi.mock("@/components/study/study-loading-overlay", () => ({
  StudyLoadingOverlay: ({ open, label }: { open: boolean; label?: string }) =>
    open ? <div role="status">{label ?? "Loading"}</div> : null,
}));

import { getAnalysisOverview } from "@/lib/api/analysis";
import { getMyProfile } from "@/lib/api/users";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";

describe("AnalysisPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads live overview when target exam is set", async () => {
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
    vi.mocked(getAnalysisOverview).mockResolvedValue({
      ok: true,
      data: ANALYSIS_PAGE_DATA.overview!,
    });

    render(<AnalysisPageClient />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Your possibilities" })
      ).toBeInTheDocument();
    });
    expect(getAnalysisOverview).toHaveBeenCalledWith("exam-neet");
    expect(screen.queryByText(/illustrative preview/i)).not.toBeInTheDocument();
  });

  it("prompts for exam when multiple are available and none preferred", async () => {
    vi.mocked(getMyProfile).mockResolvedValue({
      ok: true,
      data: { id: "u1" } as never,
    });
    vi.mocked(listShowInAppExams).mockResolvedValue([
      { id: "exam-neet", name: "NEET UG" },
      { id: "exam-jee", name: "JEE Main" },
    ]);

    render(<AnalysisPageClient />);

    await waitFor(() => {
      expect(screen.getByText("Set your target exam")).toBeInTheDocument();
    });
    expect(getAnalysisOverview).not.toHaveBeenCalled();
  });
});
