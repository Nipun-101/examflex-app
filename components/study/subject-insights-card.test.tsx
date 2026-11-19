import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubjectInsightsCard } from "@/components/study/subject-insights-card";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("SubjectInsightsCard", () => {
  it("lists subject percents and tips", () => {
    render(
      <SubjectInsightsCard section={TODAY_PAGE_DATA.subjectInsights} />
    );

    expect(
      screen.getByRole("heading", {
        name: "Where your next session can help",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(
      screen.getByText("Force & friction need another look.")
    ).toBeInTheDocument();
  });

  it("shows empty mark placeholders and subhead", () => {
    render(<SubjectInsightsCard section={TODAY_EMPTY_SEED.subjectInsights} />);

    expect(
      screen.getByText(/point to the chapter worth another look/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("— / 180")).toHaveLength(2);
    expect(screen.getByText("— / 360")).toBeInTheDocument();
  });

  it("accepts a layout className for stretched desktop columns", () => {
    const { container } = render(
      <SubjectInsightsCard
        section={TODAY_PAGE_DATA.subjectInsights}
        className="lg:flex-1"
      />
    );

    expect(container.firstElementChild).toHaveClass("lg:flex-1");
  });
});
