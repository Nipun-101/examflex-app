import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayWorkspace } from "@/components/study/today-workspace";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("TodayWorkspace", () => {
  it("composes both columns including Mistake Book", () => {
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
      screen.getByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A score is a starting point." })
    ).toBeInTheDocument();
    expect(screen.getByText(/Illustrative data/)).toBeInTheDocument();
  });

  it("applies active mobile order and desktop column structure", () => {
    render(<TodayWorkspace data={TODAY_PAGE_DATA} />);
    const workspace = screen.getByRole("region", { name: "Study workspace" });
    const columns = workspace.querySelectorAll(":scope > div > div");

    expect(columns).toHaveLength(2);

    const scoreHeading = screen.getByRole("heading", {
      name: "A score is a starting point.",
    });
    const nextStepHeading = screen.getByRole("heading", {
      name: "Your mistakes have a next chapter.",
    });
    const equationHeading = screen.getByRole("heading", {
      name: "Equation Book",
    });
    const mistakeHeading = screen.getAllByRole("heading", {
      name: "Mistake Book",
    })[0];
    const nextMockHeading = screen.getByRole("heading", {
      name: "NEET full-syllabus mock",
    });
    const perspectiveHeading = screen.getByRole("heading", {
      name: "See where you could go.",
    });
    const sessionHeading = screen.getByRole("heading", {
      name: "Your 20-minute reset",
    });
    const insightsHeading = screen.getByRole("heading", {
      name: "Where your next session can help",
    });

    expect(scoreHeading.closest(".order-1")).toHaveClass("lg:order-none");
    expect(nextStepHeading.closest(".order-2")).toHaveClass("lg:order-none");
    expect(equationHeading.closest(".order-3")).toHaveClass("lg:order-none");
    expect(mistakeHeading?.closest(".order-4")).toHaveClass("lg:order-none");
    expect(nextMockHeading.closest(".order-5")).toHaveClass("lg:order-none");
    expect(perspectiveHeading.closest(".order-6")).toHaveClass("lg:order-none");
    expect(insightsHeading.closest(".order-7")).toHaveClass("lg:order-none");
    expect(sessionHeading.closest(".order-9")).toHaveClass("lg:order-none");

    const leftCards = columns[0].querySelectorAll(":scope > div");
    const rightCards = columns[1].querySelectorAll(":scope > div");
    expect(leftCards[0]).toContainElement(nextStepHeading);
    expect(leftCards[1]).toContainElement(scoreHeading);
    expect(leftCards[2]).toContainElement(insightsHeading);
    expect(rightCards[0]).toContainElement(equationHeading);
    expect(rightCards[1]).toContainElement(mistakeHeading!);
    expect(rightCards[2]).toContainElement(nextMockHeading);
    expect(rightCards[3]).toContainElement(perspectiveHeading);
    expect(rightCards[4]).toContainElement(sessionHeading);
  });

  it("uses empty-state mobile order for new users", () => {
    render(<TodayWorkspace data={TODAY_EMPTY_SEED} />);

    const startHeading = screen.getByRole("heading", {
      name: "Your first step is one mock.",
    });
    const sessionHeading = screen.getByRole("heading", {
      name: "Your 20-minute reset",
    });
    const scoreHeading = screen.getByRole("heading", {
      name: "A score is a starting point.",
    });
    const mistakeHeading = screen.getByRole("heading", {
      name: "Mistake Book",
    });

    expect(startHeading.closest(".order-1")).toHaveClass("lg:order-none");
    expect(sessionHeading.closest(".order-9")).toHaveClass("lg:order-none");
    expect(scoreHeading.closest(".order-3")).toHaveClass("lg:order-none");
    expect(mistakeHeading.closest(".order-5")).toHaveClass("lg:order-none");
  });
});
