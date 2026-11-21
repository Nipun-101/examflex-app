import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisPathwayCard } from "@/components/analysis/analysis-pathway-card";
import type { AnalysisPathway } from "@/types/analysis";

const WAITING: AnalysisPathway = {
  id: "mbbs",
  title: "MBBS",
  subtitle: "Medicine",
  status: "NO_ATTEMPTS",
  yourMarks: null,
  cutoffMarks: null,
  comfortMarks: null,
  gapMarks: null,
  maxMarks: 720,
  attemptsConsidered: 0,
  attemptsInWindow: 0,
  minPercent: 0,
  comfortPercent: 0,
  userPercent: null,
  progress01: 0,
  band: "below",
  message: "Attempt a full mock to see how this path looks for you.",
};

const EVALUATED: AnalysisPathway = {
  ...WAITING,
  status: "EVALUATED",
  yourMarks: 584,
  cutoffMarks: 598,
  comfortMarks: 627.9,
  gapMarks: -14,
  attemptsConsidered: 8,
  attemptsInWindow: 10,
  minPercent: 83.1,
  comfortPercent: 87.2,
  userPercent: 81.1,
  progress01: 584 / 598,
  band: "below",
  message: "14 marks below the cut-off — a strong stretch, keep climbing.",
};

describe("AnalysisPathwayCard", () => {
  describe("waiting", () => {
    it("renders the dashed waiting card when there are no attempts", () => {
      render(<AnalysisPathwayCard pathway={WAITING} />);
      expect(screen.getByRole("heading", { name: "MBBS" })).toBeInTheDocument();
      expect(screen.getByText("Medicine")).toBeInTheDocument();
      expect(screen.getByText("Waiting for a score")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("renders waiting when the page says so, whatever the status", () => {
      render(<AnalysisPathwayCard pathway={EVALUATED} waiting />);
      expect(screen.getByText("Waiting for a score")).toBeInTheDocument();
      expect(screen.queryByText("Cut-off")).not.toBeInTheDocument();
    });

    it("omits the subtitle when there is none", () => {
      const { subtitle: _unused, ...rest } = WAITING;
      void _unused;
      render(<AnalysisPathwayCard pathway={rest as AnalysisPathway} />);
      expect(screen.queryByText("Medicine")).not.toBeInTheDocument();
    });
  });

  describe("cut-off not announced yet", () => {
    const noCutoff: AnalysisPathway = {
      ...WAITING,
      status: "NO_CUTOFF",
      yourMarks: 580,
      attemptsConsidered: 3,
      attemptsInWindow: 3,
      message: "Cut-off not announced yet for your recent mocks.",
    };

    it("shows the student's weighted marks and the notice, with no bar or band", () => {
      render(<AnalysisPathwayCard pathway={noCutoff} />);
      expect(screen.getByText("Your weighted marks")).toBeInTheDocument();
      expect(screen.getByText("580")).toBeInTheDocument();
      expect(screen.getByText("/ 720")).toBeInTheDocument();
      expect(
        screen.getByText("Cut-off not announced yet for your recent mocks.")
      ).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(screen.queryByText("Below cut-off")).not.toBeInTheDocument();
      expect(screen.queryByText("Cut-off")).not.toBeInTheDocument();
      expect(
        screen.getByText(/Based on your last 3 full mocks/)
      ).toBeInTheDocument();
    });

    it("still renders when the marks are unknown", () => {
      render(
        <AnalysisPathwayCard
          pathway={{ ...noCutoff, yourMarks: null, maxMarks: null }}
        />
      );
      expect(screen.queryByText("Your weighted marks")).not.toBeInTheDocument();
      expect(
        screen.getByText("Cut-off not announced yet for your recent mocks.")
      ).toBeInTheDocument();
    });
  });

  describe("evaluated", () => {
    it("shows absolute marks, the cut-off, the band chip and the API message", () => {
      render(<AnalysisPathwayCard pathway={EVALUATED} />);
      expect(screen.getByText("Your weighted marks")).toBeInTheDocument();
      expect(screen.getByText("584")).toBeInTheDocument();
      expect(screen.getByText("/ 720")).toBeInTheDocument();
      expect(screen.getByText("Cut-off")).toBeInTheDocument();
      expect(screen.getByText("598")).toBeInTheDocument();
      expect(screen.getByText("Below cut-off")).toBeInTheDocument();
      expect(screen.getByText(EVALUATED.message)).toBeInTheDocument();
      expect(
        screen.getByText(/Based on 8 of your last 10 full mocks · recent ones count more/)
      ).toBeInTheDocument();
    });

    it.each([
      ["below", "Below cut-off", "bg-rose-400"],
      ["borderline", "Within reach", "bg-amber-400"],
      ["comfortable", "Looking solid", "bg-study-green"],
    ] as const)("styles the %s band", (band, label, fillClass) => {
      render(
        <AnalysisPathwayCard
          pathway={{
            ...EVALUATED,
            band,
            yourMarks: band === "below" ? 584 : band === "borderline" ? 610 : 650,
            message: `message for ${band}`,
          }}
        />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(`message for ${band}`)).toBeInTheDocument();
      expect(screen.getByTestId("pathway-fill")).toHaveClass(fillClass);
    });

    it("draws the bar on the exam's own scale with a cut-off tick and comfort zone", () => {
      render(<AnalysisPathwayCard pathway={EVALUATED} />);
      const bar = screen.getByRole("img");
      expect(bar).toHaveAccessibleName(
        "MBBS: your weighted marks 584 out of 720; cut-off 598"
      );
      expect(screen.getByTestId("pathway-fill")).toHaveStyle({
        width: `${(584 / 720) * 100}%`,
      });
      expect(screen.getByTestId("pathway-cutoff-tick")).toHaveStyle({
        left: `${(598 / 720) * 100}%`,
      });
      const zone = screen.getByTestId("pathway-comfort-zone");
      expect(zone).toHaveStyle({ left: `${(598 / 720) * 100}%` });
      expect(within(bar.parentElement as HTMLElement).getByText("0")).toBeInTheDocument();
      expect(within(bar.parentElement as HTMLElement).getByText("720")).toBeInTheDocument();
    });

    it("uses a 300-mark scale for JEE-style exams", () => {
      render(
        <AnalysisPathwayCard
          pathway={{
            ...EVALUATED,
            maxMarks: 300,
            yourMarks: 240,
            cutoffMarks: 250,
            comfortMarks: 262.5,
            gapMarks: -10,
            message: "10 marks below the cut-off — a strong stretch, keep climbing.",
          }}
        />
      );
      expect(screen.getByText("/ 300")).toBeInTheDocument();
      expect(screen.getByRole("img")).toHaveAccessibleName(
        "MBBS: your weighted marks 240 out of 300; cut-off 250"
      );
      expect(screen.getByTestId("pathway-cutoff-tick")).toHaveStyle({
        left: `${(250 / 300) * 100}%`,
      });
    });

    it("formats decimal marks and negative marks", () => {
      render(
        <AnalysisPathwayCard
          pathway={{
            ...EVALUATED,
            yourMarks: -12.5,
            cutoffMarks: 598.25,
            comfortMarks: 628,
            gapMarks: -610.75,
          }}
        />
      );
      expect(screen.getByText("-12.5")).toBeInTheDocument();
      expect(screen.getByText("598.3")).toBeInTheDocument();
      expect(screen.getByTestId("pathway-fill")).toHaveStyle({ width: "0%" });
    });

    it("says 'last N' when every mock in the window has a cut-off", () => {
      render(
        <AnalysisPathwayCard
          pathway={{ ...EVALUATED, attemptsConsidered: 1, attemptsInWindow: 1 }}
        />
      );
      expect(screen.getByText(/Based on your last 1 full mock ·/)).toBeInTheDocument();
    });

    it("omits the subtitle when there is none", () => {
      const { subtitle: _unused, ...rest } = EVALUATED;
      void _unused;
      render(<AnalysisPathwayCard pathway={rest as AnalysisPathway} />);
      expect(screen.queryByText("Medicine")).not.toBeInTheDocument();
    });
  });

  describe("older API payloads (percent only)", () => {
    const legacy: AnalysisPathway = {
      ...EVALUATED,
      yourMarks: null,
      cutoffMarks: null,
      comfortMarks: null,
      gapMarks: null,
      maxMarks: null,
      minPercent: 80,
      comfortPercent: 90,
      userPercent: 76,
      progress01: 0.95,
      message: "A strong stretch — keep climbing toward this path.",
    };

    it("falls back to the percent card instead of breaking", () => {
      render(<AnalysisPathwayCard pathway={legacy} />);
      expect(screen.getByText("Your avg vs 80%")).toBeInTheDocument();
      expect(screen.getByText("76%")).toBeInTheDocument();
      expect(screen.getByText(legacy.message)).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: /Progress 95% toward MBBS minimum/i })
      ).toBeInTheDocument();
    });

    it("shows 0% when the percent is missing and clamps the bar", () => {
      render(
        <AnalysisPathwayCard
          pathway={{ ...legacy, userPercent: null, progress01: 1.7 }}
        />
      );
      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByRole("img")).toHaveAccessibleName(/Progress 100%/);
    });
  });
});
