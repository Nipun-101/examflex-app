import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolsSection } from "@/components/landing/tools-section";

describe("ToolsSection", () => {
  it("renders the Mistake Book and Equation Book previews", () => {
    render(<ToolsSection />);

    expect(
      screen.getByRole("heading", {
        name: "Every mistake gets a reason, a page and a timer.",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("02:14")).toBeInTheDocument();
    expect(screen.getByText("Concept gap")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Recall it. Don’t just recognise it." })
    ).toBeInTheDocument();
    expect(screen.getByText("Card 3 of 8 · Laws of motion")).toBeInTheDocument();
  });
});
