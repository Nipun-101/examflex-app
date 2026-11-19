import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionPlanCard } from "@/components/study/session-plan-card";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("SessionPlanCard", () => {
  it("lists the three reset steps", () => {
    render(<SessionPlanCard data={TODAY_PAGE_DATA.sessionPlan} />);

    expect(
      screen.getByRole("heading", { name: "Your 20-minute reset" })
    ).toBeInTheDocument();
    expect(screen.getByText("Understand 5 saved mistakes")).toBeInTheDocument();
    expect(screen.getByText("Recall 8 equations")).toBeInTheDocument();
  });

  it("marks locked steps for the empty checklist", () => {
    render(<SessionPlanCard data={TODAY_EMPTY_SEED.sessionPlan} />);

    expect(screen.getByText("Take your first mock")).toBeInTheDocument();
    expect(screen.getAllByText(/\(locked\)/)).toHaveLength(2);
  });
});
