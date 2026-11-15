import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SubjectInsightsCard } from "@/components/study/subject-insights-card";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("SubjectInsightsCard", () => {
  it("lists subject scores and tips", () => {
    render(
      <SubjectInsightsCard
        title="Where your next session can help"
        insights={TODAY_PAGE_DATA.subjectInsights}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Where your next session can help",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("124 / 180")).toBeInTheDocument();
    expect(
      screen.getByText("Force & friction need another look.")
    ).toBeInTheDocument();
  });

  it("accepts a layout className for stretched desktop columns", () => {
    const { container } = render(
      <SubjectInsightsCard
        title="Where your next session can help"
        insights={TODAY_PAGE_DATA.subjectInsights}
        className="lg:flex-1"
      />
    );

    expect(container.firstElementChild).toHaveClass("lg:flex-1");
  });
});

