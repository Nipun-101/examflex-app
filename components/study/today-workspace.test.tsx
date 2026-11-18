import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayWorkspace } from "@/components/study/today-workspace";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("TodayWorkspace", () => {
  it("composes both columns and omits the concept footer", () => {
    render(<TodayWorkspace data={TODAY_PAGE_DATA} />);

    expect(
      screen.getByRole("region", { name: "Study workspace" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Your mistakes have a next chapter.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your 20-minute reset" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A score is a starting point." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mock 12: 548 of 720" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/CONCEPT 01/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Illustrative data/)).toBeInTheDocument();
  });

  it("applies mobile-only card order without changing desktop column structure", () => {
    const { container } = render(<TodayWorkspace data={TODAY_PAGE_DATA} />);
    const workspace = screen.getByRole("region", { name: "Study workspace" });
    const columns = workspace.querySelectorAll(":scope > div > div");

    expect(columns).toHaveLength(2);
    expect(columns[0]).toHaveClass(
      "contents",
      "lg:flex",
      "lg:h-full",
      "lg:flex-col",
      "lg:gap-5"
    );
    expect(columns[1]).toHaveClass(
      "contents",
      "lg:flex",
      "lg:h-full",
      "lg:flex-col",
      "lg:gap-5"
    );

    const scoreHeading = screen.getByRole("heading", {
      name: "A score is a starting point.",
    });
    const mistakesHeading = screen.getByRole("heading", {
      name: "Your mistakes have a next chapter.",
    });
    const equationHeading = screen.getByRole("heading", {
      name: "Equation Book",
    });
    const perspectiveHeading = screen.getByRole("heading", {
      name: "See where you could go.",
    });
    const nextMockHeading = screen.getByRole("heading", {
      name: "NEET full-syllabus mock",
    });
    const sessionHeading = screen.getByRole("heading", {
      name: "Your 20-minute reset",
    });
    const insightsHeading = screen.getByRole("heading", {
      name: "Where your next session can help",
    });

    expect(scoreHeading.closest(".order-1")).toHaveClass("lg:order-none");
    expect(mistakesHeading.closest(".order-2")).toHaveClass("lg:order-none");
    expect(equationHeading.closest(".order-3")).toHaveClass("lg:order-none");
    expect(perspectiveHeading.closest(".order-4")).toHaveClass("lg:order-none");
    expect(nextMockHeading.closest(".order-5")).toHaveClass("lg:order-none");
    expect(insightsHeading.closest(".order-6")).toHaveClass("lg:order-none");
    expect(sessionHeading.closest(".order-7")).toHaveClass("lg:order-none");

    // Desktop column DOM order stays: left next→score→subjects, right plan→equation→mock→perspective
    const leftCards = columns[0].querySelectorAll(":scope > div");
    const rightCards = columns[1].querySelectorAll(":scope > div");
    expect(leftCards[0]).toContainElement(mistakesHeading);
    expect(leftCards[1]).toContainElement(scoreHeading);
    expect(leftCards[2]).toContainElement(insightsHeading);
    expect(rightCards[0]).toContainElement(sessionHeading);
    expect(rightCards[1]).toContainElement(equationHeading);
    expect(rightCards[2]).toContainElement(nextMockHeading);
    expect(rightCards[3]).toContainElement(perspectiveHeading);

    expect(container.querySelectorAll(".order-1, .order-2, .order-3")).toHaveLength(
      3
    );
  });
});
