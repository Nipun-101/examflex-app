import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeading } from "@/components/landing/section-heading";

describe("SectionHeading", () => {
  it("renders centered eyebrow, title, and description by default", () => {
    const { container } = render(
      <SectionHeading
        eyebrow="Practice"
        title="Tests that feel like the real thing"
        description="Pick up where you left off."
      />
    );

    expect(screen.getByText("Practice")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Tests that feel like the real thing",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("Pick up where you left off.")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("text-center");
  });

  it("supports left alignment and custom class names without description", () => {
    const { container } = render(
      <SectionHeading
        eyebrow="Why"
        title="Study smarter"
        align="left"
        className="custom-heading"
      />
    );

    expect(container.firstChild).toHaveClass("text-left", "custom-heading");
    expect(screen.queryByText(/Pick up/)).not.toBeInTheDocument();
  });
});
