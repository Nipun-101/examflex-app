import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";

describe("HowItWorksSection", () => {
  it("renders the four-step loop", () => {
    render(<HowItWorksSection />);

    expect(
      screen.getByRole("heading", {
        name: "One loop. Every test makes the next one better.",
      })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    for (const title of [
      "Take a mock",
      "Understand every miss",
      "Recall, don’t reread",
      "See where you stand",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });
});
