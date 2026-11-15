import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudyLoader } from "@/components/study/study-loader";

describe("StudyLoader", () => {
  it("exposes a polite status for screen readers", () => {
    render(<StudyLoader />);

    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.getByText("Loading")).toHaveClass("sr-only");
  });

  it("shows a visible label when provided", () => {
    render(<StudyLoader label="Fetching cards" size="sm" />);

    expect(
      screen.getByRole("status", { name: "Fetching cards" })
    ).toBeInTheDocument();
    expect(screen.getByText("Fetching cards")).toBeInTheDocument();
  });
});
