import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PerformanceBadge } from "@/components/attempt/performance-badge";

describe("PerformanceBadge", () => {
  it("shows the band for the score", () => {
    render(<PerformanceBadge score={90} totalScore={100} bands={undefined} language="en" />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();
  });

  it("localises and honours exam bands", () => {
    render(
      <PerformanceBadge
        score={10}
        totalScore={100}
        bands={[{ key: "good", minPercent: 5 }]}
        language="ml"
      />
    );
    expect(screen.getByText("നല്ലത്")).toBeInTheDocument();
  });

  it("can hide the emoji and override colors for dark surfaces", () => {
    render(
      <PerformanceBadge
        score={10}
        totalScore={100}
        bands={undefined}
        language="en"
        showEmoji={false}
        className="bg-study-lime text-study-ink"
      />
    );
    expect(screen.getByText("Needs more improvement")).toBeInTheDocument();
    expect(screen.queryByText("😊")).not.toBeInTheDocument();
  });
});
