import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisView } from "@/components/analysis/analysis-view";
import {
  ANALYSIS_PAGE_DATA,
  buildAnalysisPageData,
} from "@/lib/analysis/static-data";
import type { AnalysisOverview, AnalysisPathway } from "@/types/analysis";

const EVALUATED_MBBS: AnalysisPathway = {
  id: "mbbs",
  title: "MBBS",
  subtitle: "Medicine",
  status: "EVALUATED",
  yourMarks: 584,
  cutoffMarks: 598,
  comfortMarks: 627.9,
  gapMarks: -14,
  maxMarks: 720,
  attemptsConsidered: 2,
  attemptsInWindow: 2,
  minPercent: 83,
  comfortPercent: 87,
  userPercent: 81,
  progress01: 0.98,
  band: "below",
  message: "14 marks below the cut-off — a strong stretch, keep climbing.",
};

const NO_CUTOFF_BDS: AnalysisPathway = {
  ...EVALUATED_MBBS,
  id: "bds",
  title: "BDS",
  subtitle: "Dental",
  status: "NO_CUTOFF",
  cutoffMarks: null,
  comfortMarks: null,
  gapMarks: null,
  progress01: 0,
  message: "Cut-off not announced yet for your recent mocks.",
};

function overviewWith(
  offerings: AnalysisPathway[],
  hasScore: boolean
): AnalysisOverview {
  const base = ANALYSIS_PAGE_DATA.overview!;
  return {
    ...base,
    fullMocks: hasScore
      ? {
          ...base.fullMocks,
          completedCount: 2,
          latest: {
            attemptId: "a2",
            title: "Mock 13",
            score: 590,
            maxScore: 720,
            percent: 81.9,
            submittedAt: "2026-01-09T00:00:00.000Z",
            deltaFromPrevious: 42,
          },
          recent: [],
        }
      : base.fullMocks,
    pathways: {
      averagePercent: hasScore ? 80 : null,
      attemptCountUsed: hasScore ? 2 : 0,
      offerings,
    },
    engagement: { ...base.engagement, hasFullMocks: hasScore },
  };
}

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
      screen.getByTestId("analysis-counseling-card")
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

  it("shows scored performance without edit when latest exists", () => {
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
            ...EVALUATED_MBBS,
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
    expect(
      screen.getByText("Based on marks from your latest full mock")
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });

  it("renders marks-based cards for each course, including one without a cut-off yet", () => {
    const data = buildAnalysisPageData(
      overviewWith([EVALUATED_MBBS, NO_CUTOFF_BDS], true)
    );
    render(<AnalysisView data={data} />);

    expect(screen.getByRole("heading", { name: "MBBS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "BDS" })).toBeInTheDocument();
    expect(screen.getByText("Below cut-off")).toBeInTheDocument();
    expect(screen.getByText(EVALUATED_MBBS.message)).toBeInTheDocument();
    expect(screen.getByText(NO_CUTOFF_BDS.message)).toBeInTheDocument();
    expect(screen.getAllByText("Your weighted marks")).toHaveLength(2);
    expect(screen.getByText("598")).toBeInTheDocument();
  });

  it("keeps cards in the order the API sends them", () => {
    const data = buildAnalysisPageData(
      overviewWith([NO_CUTOFF_BDS, EVALUATED_MBBS], true)
    );
    render(<AnalysisView data={data} />);
    const headings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(headings.indexOf("BDS")).toBeLessThan(headings.indexOf("MBBS"));
  });

  it("shows every course as waiting until the first full-mock score exists", () => {
    const data = buildAnalysisPageData(
      overviewWith([EVALUATED_MBBS, NO_CUTOFF_BDS], false)
    );
    render(<AnalysisView data={data} />);
    expect(screen.getAllByText("Waiting for a score")).toHaveLength(2);
    expect(screen.queryByText("Below cut-off")).not.toBeInTheDocument();
    expect(screen.queryByText("Your weighted marks")).not.toBeInTheDocument();
  });

  it("describes the comparison in the section subtitle once a score exists", () => {
    const data = buildAnalysisPageData(overviewWith([EVALUATED_MBBS], true));
    render(<AnalysisView data={data} />);
    expect(
      screen.getByText("Your recent full mocks vs each course's cut-off")
    ).toBeInTheDocument();
  });
});
