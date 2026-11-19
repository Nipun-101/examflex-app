import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AnalysisPathwayCard } from "@/components/analysis/analysis-pathway-card";
import type { AnalysisPathway } from "@/types/analysis";

const SAMPLE_PATHWAY: AnalysisPathway = {
  id: "mbbs",
  title: "MBBS",
  subtitle: "Medicine",
  minPercent: 80,
  comfortPercent: 90,
  userPercent: null,
  progress01: 0,
  band: "below",
  message: "Waiting for a score",
};

describe("AnalysisPathwayCard", () => {
  it("renders waiting state with dashed card", () => {
    render(<AnalysisPathwayCard pathway={SAMPLE_PATHWAY} waiting />);
    expect(
      screen.getByRole("heading", { name: SAMPLE_PATHWAY.title })
    ).toBeInTheDocument();
    expect(screen.getByText("Waiting for a score")).toBeInTheDocument();
  });

  it("renders progress when a score is available", () => {
    const pathway: AnalysisPathway = {
      ...SAMPLE_PATHWAY,
      userPercent: 76,
      progress01: 0.95,
      band: "below",
      message: "A strong stretch — keep climbing toward this path.",
    };

    render(<AnalysisPathwayCard pathway={pathway} />);
    expect(screen.getByText(pathway.message)).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: new RegExp(`Progress .* toward ${pathway.title}`, "i"),
      })
    ).toBeInTheDocument();
  });
});
