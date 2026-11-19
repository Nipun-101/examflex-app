import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisView } from "@/components/analysis/analysis-view";
import { ANALYSIS_PAGE_DATA } from "@/lib/analysis/static-data";
import { buildAnalysisPageData } from "@/lib/analysis/static-data";

describe("AnalysisView", () => {
  it("renders the empty possibilities outlook", () => {
    render(<AnalysisView data={ANALYSIS_PAGE_DATA} />);

    expect(
      screen.getByRole("heading", { name: "Your possibilities" })
    ).toBeInTheDocument();
    expect(screen.getByText("— / 720")).toBeInTheDocument();
    expect(
      screen.getByText(/Appears after your first full mock/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "What this level could open up" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Pathway outlook available soon/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Unlock your full-mock trend/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Attempt a full mock/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open chapter wise/i })
    ).toBeInTheDocument();
  });

  it("shows scored performance when latest exists", () => {
    const data = buildAnalysisPageData({
      ...ANALYSIS_PAGE_DATA.overview!,
      fullMocks: {
        ...ANALYSIS_PAGE_DATA.overview!.fullMocks,
        completedCount: 1,
        needsMoreAttempts: true,
        latest: {
          attemptId: "a1",
          title: "Mock 12",
          score: 548,
          maxScore: 720,
          percent: 76.1,
          submittedAt: "2026-01-02T00:00:00.000Z",
          deltaFromPrevious: null,
        },
        recent: [
          {
            attemptId: "a1",
            label: "Mock 1",
            title: "Mock 12",
            score: 548,
            maxScore: 720,
            percent: 76.1,
            submittedAt: "2026-01-02T00:00:00.000Z",
          },
        ],
      },
      pathways: {
        averagePercent: 76.1,
        attemptCountUsed: 1,
        offerings: [
          {
            id: "mbbs",
            title: "MBBS",
            subtitle: "Medicine",
            minPercent: 80,
            comfortPercent: 90,
            userPercent: 76.1,
            progress01: 0.95,
            band: "below",
            message: "A strong stretch — keep climbing toward this path.",
          },
        ],
      },
      engagement: {
        hasFullMocks: true,
        hasChapterWise: false,
        fullMockTarget: 5,
        fullMocksRemaining: 4,
      },
    });

    render(<AnalysisView data={data} />);
    expect(screen.getByText("548 / 720")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
