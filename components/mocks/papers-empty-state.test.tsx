import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PapersEmptyState } from "@/components/mocks/papers-empty-state";

describe("PapersEmptyState", () => {
  it("renders the hero, timeline steps, and wait tips", () => {
    render(<PapersEmptyState paperType="TOPIC_WISE" />);
    expect(screen.getByText("Your selection")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Nothing here yet, but it's on the way/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Chapter picked")).toBeInTheDocument();
    expect(screen.getAllByText("Papers being written").length).toBeGreaterThan(0);
    expect(screen.getByText(/While you wait/i)).toBeInTheDocument();
    expect(screen.getByText(/TIP · Physics/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Write the unit beside every number/i)
    ).toBeInTheDocument();
  });

  it("uses sprint-specific first-step copy", () => {
    render(<PapersEmptyState paperType="SPRINT" />);
    expect(screen.getByText("Rapid Round picked")).toBeInTheDocument();
    expect(screen.getByText(/Rapid Rounds are added/i)).toBeInTheDocument();
  });
});
